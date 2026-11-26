import React from 'react';
import { ScrollView, View } from 'react-native';
import { CATS } from '../data';
import { IT, applyPrices } from '../engine';
import { useStore } from '../store';
import { Btn, Card, H1, H2, Input, Row, Sep, T, Tag } from '../ui';

export default function Prices() {
  const { S, set } = useStore();
  applyPrices({ region: S.st.region, precos: S.precos, obs: S.obs, cartobs: S.cartobs });
  const setPrice = (id, k, txt) => {
    const v = parseFloat(txt.replace(',', '.'));
    if (!(v > 0)) return;
    set((s) => { const o = { ...s.precos }; const a = [...(o[id] || [])]; a[k] = v; o[id] = a; return { precos: o }; }, true);
  };
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <H1>Tabela de preços</H1>
      <Card kind="ok">
        <T>Itens "pesquisado" vêm da cesta básica DIEESE de out/2026 (Fortaleza para o Ceará, Procon-SP para São Paulo). Itens "estimativa" são aproximações ajustadas pelo custo da cesta da sua cidade. Itens "pelo que você pagou" foram ajustados com os preços que você digitou no mercado ou na nota fiscal.</T>
        <Btn alt title="Voltar aos preços originais" style={{ marginTop: 12 }} onPress={() => set({ precos: {}, obs: {}, cartobs: {} }, true)} />
      </Card>
      {CATS.map((cat) => (
        <Card key={cat}>
          <H2>{cat}</H2>
          {Object.values(IT).filter((i) => i.cat === cat).map((i) => i.packs.map((pk, k) => (
            <View key={i.id + k}>
              <Sep />
              <Row style={{ paddingVertical: 8 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <T size={15}>{i.n}</T>
                  <Tag kind={i.adj ? 'n' : i.rsrc === 'e' ? 'e' : ''} label={i.adj ? 'pelo que você pagou' : i.rsrc === 'd' ? 'pesquisado (Fortaleza)' : i.rsrc === 'p' ? 'pesquisado (SP)' : 'estimativa'} />
                  <T mute size={13}>{i.step ? 'preço por kg, a granel' : pk.l}{S.precos[i.id] && S.precos[i.id][k] != null ? ' · alterado por você' : ''}</T>
                </View>
                <Input key={pk.p} style={{ width: 100, textAlign: 'right' }} keyboardType="decimal-pad" defaultValue={pk.p.toFixed(2)}
                  onEndEditing={(e) => setPrice(i.id, k, e.nativeEvent.text)} accessibilityLabel={'Preço de ' + i.n} />
              </Row>
            </View>
          )))}
        </Card>
      ))}
    </ScrollView>
  );
}
