import React, { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATS } from '../data';
import { IT, LEVELS, Q, R$, parseNota } from '../engine';
import { useStore } from '../store';
import { Btn, Card, H1, H2, Hint, Input, Meter, Row, Sep, Sheet, T, useC } from '../ui';

// Câmera para ler o QR Code da nota fiscal (NFC-e)
function Scanner({ visible, onClose, onCode }) {
  const [perm, ask] = useCameraPermissions();
  const ins = useSafeAreaInsets();
  const [done, setDone] = useState(false);
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} onShow={() => setDone(false)}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {perm && perm.granted ? (
          <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={done ? undefined : (r) => { setDone(true); onCode(r.data); }} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 16 }}>
            <T color="#fff" size={18} style={{ textAlign: 'center' }}>Para ler o QR Code da nota, o app precisa usar a câmera.</T>
            <Btn title="Permitir câmera" onPress={ask} />
          </View>
        )}
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 24 + ins.bottom, gap: 10 }}>
          {perm && perm.granted && <T color="#fff" style={{ textAlign: 'center' }}>Aponte para o QR Code no rodapé do cupom fiscal.</T>}
          <Btn alt title="Cancelar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

// Registrar a compra a partir da nota
function Nota({ nf, items, onSave }) {
  const [tot, setTot] = useState('');
  const [paid, setPaid] = useState({});
  const est = items.reduce((s, i) => s + i.cost, 0);
  return (<>
    <H1>Registrar compra</H1>
    {[['Nota', `${nf.mod === '65' ? 'NFC-e (cupom)' : nf.mod === '55' ? 'NF-e' : 'modelo ' + nf.mod}, ${nf.uf}, ${nf.when}`], ['CNPJ da loja', nf.cnpj], ['Chave', nf.k.replace(/(\d{4})/g, '$1 ').trim()]].map(([a, b]) => (
      <Row key={a} style={{ alignItems: 'flex-start', marginBottom: 4 }}><T mute style={{ width: 100 }}>{a}</T><T style={{ flex: 1 }}>{b}</T></Row>
    ))}
    {nf.link && <Btn small alt style={{ marginVertical: 10 }} title="Abrir a nota no site da Sefaz" onPress={() => Linking.openURL(nf.link)} />}
    <Card kind="tip" style={{ marginTop: 8 }}><T>Em breve um servidor busca os itens da nota na Sefaz automaticamente. Por enquanto, digite o total e, se quiser, o que pagou em cada item.</T></Card>
    <T b style={{ marginBottom: 6 }}>Total pago (R$)</T>
    <Input keyboardType="decimal-pad" value={tot} onChangeText={setTot} placeholder={est ? est.toFixed(2) : ''} />
    {items.length > 0 && <H2 style={{ marginTop: 16 }}>Quanto pagou em cada item (opcional)</H2>}
    {items.map((i) => (
      <Row key={i.id} style={{ paddingVertical: 6 }}>
        <View style={{ flex: 1 }}><T size={15}>{IT[i.id].n}</T><T mute size={13}>{i.desc} · estimado {R$(i.cost)}</T></View>
        <Input style={{ width: 100, textAlign: 'right' }} keyboardType="decimal-pad" value={paid[i.id] || ''} onChangeText={(v) => setPaid({ ...paid, [i.id]: v })} />
      </Row>
    ))}
    <Btn style={{ marginTop: 14 }} title="Salvar compra" onPress={() => {
      const t = parseFloat(tot.replace(',', '.'));
      if (!(t > 0)) return;
      onSave(t, est, Object.fromEntries(Object.entries(paid).map(([k, v]) => [k, parseFloat(String(v).replace(',', '.'))]).filter(([, v]) => v > 0)));
    }} />
  </>);
}

export default function List() {
  const c = useC();
  const { S, set, plan } = useStore();
  const [scan, setScan] = useState(false);
  const [nf, setNf] = useState(null);
  const [qrTxt, setQrTxt] = useState('');
  const [msg, setMsg] = useState('');
  const [copyMsg, setCopyMsg] = useState('');

  if (!plan) return <ScrollView contentContainerStyle={{ padding: 16 }}><H1>Lista de compras</H1><Card><T>Gere um cardápio primeiro.</T></Card></ScrollView>;

  const items = plan.res.items, checked = new Set(S.checked), cart = S.cart, bud = +S.st.budget || 0;
  const on = items.filter((i) => checked.has(i.id)), off = items.filter((i) => !checked.has(i.id));
  const inCart = on.reduce((s, i) => s + (cart[i.id] != null ? cart[i.id] : i.cost), 0), left = off.reduce((s, i) => s + i.cost, 0);
  const real = on.filter((i) => cart[i.id] != null).length, proj = inCart + left, over = proj > bud && bud > 0;

  const toggle = (id) => set((s) => ({ checked: s.checked.includes(id) ? s.checked.filter((x) => x !== id) : [...s.checked, id] }));
  const setPaid = (i, txt) => {
    const v = parseFloat(txt.replace(',', '.'));
    set((s) => {
      const cart2 = { ...s.cart }, cob = { ...s.cartobs };
      if (v >= 0 && txt !== '') cart2[i.id] = v; else delete cart2[i.id];
      if (cart2[i.id] > 0 && i.cost > 0) cob[i.id] = +(cart2[i.id] / i.cost).toFixed(3); else delete cob[i.id];
      return { cart: cart2, cartobs: cob };
    });
  };
  const text = () => 'Lista de compras\n' + CATS.map((cat) => {
    const its = items.filter((i) => IT[i.id].cat === cat);
    return its.length ? `\n${cat}\n` + its.map((i) => `${checked.has(i.id) ? '[x]' : '[ ]'} ${IT[i.id].n}: ${i.desc} (${R$(i.cost)})`).join('\n') : '';
  }).join('') + `\n\nTotal estimado: ${R$(plan.res.cost)}`;
  const openNota = (txt) => {
    const n = parseNota(txt);
    if (!n) { setMsg('Esse código não parece de uma nota fiscal (falta a chave de 44 dígitos).'); return; }
    setMsg(''); setNf(n);
  };
  const saveNota = (tot, est, paid) => {
    const n = Object.keys(paid).length;
    set((s) => {
      const obs = { ...s.obs };
      for (const [id, v] of Object.entries(paid)) { const it = items.find((x) => x.id === id); if (it && it.cost > 0) obs[id] = [...(obs[id] || []), +(v / it.cost).toFixed(3)]; }
      const isNew = !s.hist.some((x) => x.k === nf.k);
      return {
        obs,
        pts: s.pts + (isNew ? 50 + 5 * n : 0),
        hist: isNew ? [{ k: nf.k, at: Date.now(), tot, est: +est.toFixed(2), cnpj: nf.cnpj, uf: nf.uf, n }, ...s.hist].slice(0, 24) : s.hist,
      };
    }, true);
    setNf(null); setQrTxt('');
  };

  const p = S.pts, cur = LEVELS.filter((l) => p >= l[0]).pop(), nx = LEVELS.find((l) => l[0] > p);
  let n = 0;
  return (
    <View style={{ flex: 1 }}>
      <Row style={{ justifyContent: 'space-between', backgroundColor: c.g, paddingHorizontal: 16, paddingVertical: 10 }}>
        <T color="#fff" size={15}>Carrinho <T b color="#fff" size={15}>{R$(inCart)}</T></T>
        <T b={over} color={over ? '#ffd0ca' : '#fff'} size={15}>{over ? 'Estoura ' + R$(proj - bud) : 'Sobra ' + R$(bud - proj)}</T>
      </Row>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <H1>Lista de compras</H1>
        <Card kind="sum">
          <T color="#ffffffe0">{on.length} de {items.length} no carrinho{real ? ` · ${real} com preço real` : ''}</T>
          <T color="#fff" size={40} style={{ fontWeight: '800', lineHeight: 46 }}>{R$(inCart)}</T>
          <T color="#ffffffe0">no carrinho agora{bud ? ` · restam ${R$(Math.max(0, bud - inCart))} do orçamento de ${R$(bud)}` : ''}</T>
          <Meter pct={bud ? (inCart / bud) * 100 : 0} over={over} />
          <T color="#ffffffe0">Falta pegar cerca de {R$(left)}. Previsão do total: <T b color="#fff">{R$(proj)}</T></T>
        </Card>
        {over ? <Card kind="warn"><T><T b>Vai estourar {R$(proj - bud)}.</T> Com os preços de hoje, a compra passa do orçamento. Dá para trocar marcas, deixar lanches para depois ou usar as trocas do cardápio.</T></Card>
          : on.length > 0 ? <Card kind="ok"><T>Dentro do orçamento: sobram cerca de {R$(bud - proj)} no fim da compra.</T></Card> : null}

        {CATS.map((cat) => {
          const its = items.filter((i) => IT[i.id] && IT[i.id].cat === cat).sort((a, b) => IT[a.id].n.localeCompare(IT[b.id].n));
          if (!its.length) return null;
          n++;
          return (
            <Card key={cat}>
              <H2>Corredor {n} · {cat}</H2>
              {its.map((i, j) => {
                const ck = checked.has(i.id);
                return (
                  <View key={i.id}>
                    {j > 0 && <Sep />}
                    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: ck }} onPress={() => toggle(i.id)} style={{ flexDirection: 'row', gap: 12, paddingVertical: 10, alignItems: 'flex-start' }}>
                      <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: ck ? c.g : c.mute, backgroundColor: ck ? c.g : 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                        {ck && <T b color="#fff" size={15} style={{ lineHeight: 18 }}>✓</T>}
                      </View>
                      <View style={{ flex: 1, opacity: ck ? 0.5 : 1 }}>
                        <T style={ck && { textDecorationLine: 'line-through' }}>{IT[i.id].n}</T>
                        <T mute size={14}>{i.desc}{i.need ? ' · usa ' + Q(i.id, i.need) : ''}{i.uses > 1 ? ' · em ' + i.uses + ' receitas' : ''}{i.have ? ' · já tem ' + Q(i.id, i.have) : ''}</T>
                      </View>
                      <T b style={{ opacity: ck ? 0.5 : 1 }}>{R$(i.cost)}</T>
                    </Pressable>
                    {ck && (
                      <Row style={{ paddingLeft: 36, paddingBottom: 10 }}>
                        <T mute size={14} style={{ flex: 1 }}>Quanto pagou neste item</T>
                        <T>R$</T>
                        <Input style={{ width: 110, textAlign: 'right' }} keyboardType="decimal-pad" placeholder={i.cost.toFixed(2)}
                          defaultValue={cart[i.id] != null ? String(cart[i.id]) : ''} onEndEditing={(e) => setPaid(i, e.nativeEvent.text)} />
                      </Row>
                    )}
                  </View>
                );
              })}
            </Card>
          );
        })}

        <Card>
          <H2>Fazer a compra junto com a família</H2>
          <Hint style={{ marginTop: 0, marginBottom: 10 }}>Mande a lista por WhatsApp ou outro app. A lista em tempo real, com o check de cada um, chega na próxima versão.</Hint>
          <Row>
            <Btn style={{ flex: 1 }} title="Compartilhar" onPress={() => Share.share({ message: text() })} />
            <Btn style={{ flex: 1 }} alt title="Copiar texto" onPress={async () => { await Clipboard.setStringAsync(text()); setCopyMsg('Lista copiada. Cole no WhatsApp ou nas notas.'); }} />
          </Row>
          {copyMsg ? <Hint>{copyMsg}</Hint> : null}
        </Card>

        <Card>
          <H2>Terminou a compra?</H2>
          <Hint style={{ marginTop: 0, marginBottom: 10 }}>Leia o QR Code da nota fiscal para registrar quanto gastou de verdade e ajustar os preços médios.</Hint>
          <Btn title="Ler QR Code da nota" onPress={() => setScan(true)} />
          <Row style={{ marginTop: 10 }}>
            <Input style={{ flex: 1 }} value={qrTxt} onChangeText={setQrTxt} placeholder="ou cole o link do QR Code" autoCapitalize="none" />
            <Btn small alt title="Ler" onPress={() => openNota(qrTxt)} />
          </Row>
          {msg ? <Hint>{msg}</Hint> : null}
          <Card kind="tip" style={{ marginTop: 12, marginBottom: 0 }}>
            <T b>{p} pontos · {cur[1]}</T>
            <Hint>Cada nota vale 50 pontos e cada preço que você confirma vale mais 5, porque ajuda a média de preços da sua região.{nx ? ` Faltam ${nx[0] - p} para “${nx[1]}”.` : ''}</Hint>
          </Card>
        </Card>

        {S.hist.length > 0 && (
          <Card>
            <H2>Suas compras</H2>
            {S.hist.map((x, j) => {
              const d = new Date(x.at), df = x.tot - x.est;
              return (
                <View key={x.k}>{j > 0 && <Sep />}
                  <Row style={{ paddingVertical: 8 }}>
                    <View style={{ flex: 1 }}><T size={15}>{d.getDate()}/{d.getMonth() + 1} · loja {x.cnpj}</T>
                      <T mute size={13}>estimado {R$(x.est)} · {df >= 0 ? R$(df) + ' acima' : R$(-df) + ' abaixo'}{x.n ? ' · ' + x.n + ' preços ajustados' : ''}</T></View>
                    <T b>{R$(x.tot)}</T>
                  </Row>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
      <Scanner visible={scan} onClose={() => setScan(false)} onCode={(d) => { setScan(false); openNota(d); }} />
      <Sheet visible={!!nf} onClose={() => setNf(null)}>
        {nf && <Nota nf={nf} items={items} onSave={saveNota} />}
      </Sheet>
    </View>
  );
}
