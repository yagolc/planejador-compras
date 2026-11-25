import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { REG, RESTR, CUIS, DIS_QUICK } from '../data';
import { IT, R$, findItem, regionOf } from '../engine';
import { useStore } from '../store';
import { Btn, Card, Check, Chip, Chips, Grid, H1, Hint, Input, Opt, Row, T, useC } from '../ui';
import Basket from '../Basket';

const PAN_QUICK = ['arroz', 'feijao', 'oleo', 'sal', 'acucar', 'cafe', 'macarrao', 'alho', 'cebola', 'ovos'];

// Campo para adicionar um ingrediente pelo nome (busca na tabela de preços)
function AddItem({ placeholder, onAdd }) {
  const [v, setV] = useState('');
  const [ph, setPh] = useState(placeholder);
  const go = () => {
    if (!v.trim()) return;
    const it = findItem(v);
    setV('');
    if (!it) { setPh('Não achei na tabela de preços'); return; }
    setPh(placeholder); onAdd(it.id);
  };
  return (
    <Row style={{ marginTop: 10 }}>
      <Input style={{ flex: 1 }} value={v} onChangeText={setV} placeholder={ph} onSubmitEditing={go} returnKeyType="done" />
      <Btn title="Adicionar" alt small onPress={go} />
    </Row>
  );
}

export default function Plan({ onDone }) {
  const c = useC();
  const { S, setForm, generate } = useStore();
  const st = S.st;
  const [wi, setWi] = useState(-1);
  const pick = (key, v, recompute) => setForm({ [key]: v }, recompute);
  const toggle = (key, v) => setForm((f) => ({ [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] }));
  const opts = (key, list, cols, recompute) => (
    <Grid cols={cols || 1}>
      {list.map(([v, l]) => <Opt key={String(v)} label={String(l)} center={cols > 2} on={String(st[key]) === String(v)} onPress={() => pick(key, v, recompute)} />)}
    </Grid>
  );

  const steps = [
    () => (<>
      <H1>Onde você faz compras?</H1>
      <Hint>Os preços médios mudam de cidade para cidade.</Hint>
      {opts('region', REG.map((r) => [r[0], r[1]]), 1, true)}
      <Hint>Quixadá usa os preços da pesquisa DIEESE de Fortaleza (out/2026) até termos dados do interior.</Hint>
    </>),
    () => (<><H1>Para quantas pessoas?</H1>{opts('people', [1, 2, 3, 4, 5, 6, 7, 8].map((n) => [n, n]), 4)}</>),
    () => (<><H1>Por quanto tempo?</H1>{opts('days', [[7, '1 semana'], [10, '10 dias'], [14, '2 semanas'], [21, '3 semanas'], [30, '1 mês']])}</>),
    () => (<>
      <H1>Quanto você pode gastar?</H1>
      {opts('budget', [150, 200, 250, 300, 400, 500, 700, 1000].map((v) => [v, 'R$ ' + v.toLocaleString('pt-BR')]), 2)}
      <T b style={{ marginTop: 4, marginBottom: 6 }}>Outro valor</T>
      <Row>
        <T b size={28} color={c.gt}>R$</T>
        <Input style={{ flex: 1, fontSize: 28, fontWeight: '800' }} keyboardType="decimal-pad" value={String(st.budget)}
          onChangeText={(t) => pick('budget', Math.max(0, +t.replace(',', '.') || 0))} />
      </Row>
    </>),
    () => (<>
      <H1>Quais refeições você faz em casa?</H1>
      {opts('mpd', [[2, 'Almoço e jantar'], [1, 'Só uma refeição principal']])}
      <Check on={st.bf} onPress={() => pick('bf', !st.bf)} label="Também tomo café da manhã em casa" />
    </>),
    () => (<>
      <H1>Quantas vezes por semana você come fora?</H1>
      <Hint>Restaurante, marmita do trabalho, delivery. Essas refeições saem da compra.</Hint>
      {opts('out', [[0, 'Nunca'], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [7, 7], [10, 10]], 4)}
    </>),
    () => (<>
      <H1>Quantas vezes por semana você cozinha?</H1>
      <Hint>Cozinhando menos vezes, cada preparo rende mais refeições.</Hint>
      {opts('cook', [[7, 'Todo dia'], [4, '3 a 4 vezes'], [2, '1 a 2 vezes']])}
      <Check on={st.marmita} onPress={() => pick('marmita', !st.marmita)} label="Modo marmita">
        <Hint>Cozinhe tudo num dia da semana e congele o que passar de 3 dias.</Hint>
      </Check>
    </>),
    () => (<>
      <H1>Quer lanches entre as refeições?</H1>
      <Hint>Fruta, pipoca, iogurte, biscoito…</Hint>
      {opts('snk', [[0, 'Não, obrigado'], [1, '1 lanche por dia'], [2, '2 lanches por dia']])}
    </>),
    () => (<>
      <H1>Alguma restrição ou intolerância?</H1>
      <Hint>Toque em todas que valem. Se não tiver, é só continuar.</Hint>
      <Chips>{RESTR.map((r) => <Chip key={r[0]} label={r[1]} on={st.restr.includes(r[0])} onPress={() => toggle('restr', r[0])} />)}</Chips>
    </>),
    () => (<>
      <H1>Que comida você curte?</H1>
      <Hint>Escolha quantas quiser. Sem escolha, o app varia entre todas.</Hint>
      <Chips>{CUIS.map((x) => <Chip key={x} label={x} on={st.cuis.includes(x)} onPress={() => toggle('cuis', x)} />)}</Chips>
    </>),
    () => (<>
      <H1>Tem algum ingrediente que você não gosta?</H1>
      <Hint>Se for só tempero, ele sai da receita. Se for o principal, a receita sai do cardápio.</Hint>
      <Chips>{[...new Set([...DIS_QUICK, ...st.dis])].map((id) => <Chip key={id} no label={IT[id].n} on={st.dis.includes(id)} onPress={() => toggle('dis', id)} />)}</Chips>
      <AddItem placeholder="Outro ingrediente…" onAdd={(id) => setForm((f) => ({ dis: f.dis.includes(id) ? f.dis : [...f.dis, id] }))} />
    </>),
    () => (<>
      <H1>O que você já tem em casa?</H1>
      <Hint>Sai da lista e do custo. Deixe a quantidade vazia se tem bastante.</Hint>
      <Chips>{PAN_QUICK.map((id) => (
        <Chip key={id} label={IT[id].n} on={id in st.pantry}
          onPress={() => setForm((f) => { const p = { ...f.pantry }; if (id in p) delete p[id]; else p[id] = null; return { pantry: p }; })} />
      ))}</Chips>
      <View style={{ marginTop: 12 }}>
        {Object.entries(st.pantry).map(([id, q]) => (
          <Row key={id} style={{ paddingVertical: 6 }}>
            <T style={{ flex: 1 }}>{IT[id].n}</T>
            <Input style={{ width: 110, textAlign: 'right' }} keyboardType="number-pad" placeholder="bastante"
              defaultValue={q == null ? '' : String(id === 'ovos' ? Math.round(q / 50) : q)}
              onEndEditing={(e) => { const t = e.nativeEvent.text; setForm((f) => ({ pantry: { ...f.pantry, [id]: t === '' ? null : Math.max(0, +t || 0) * (id === 'ovos' ? 50 : 1) } })); }} />
            <T style={{ width: 22 }}>{id === 'ovos' ? 'un' : 'g'}</T>
            <Pressable accessibilityLabel={'Tirar ' + IT[id].n} onPress={() => setForm((f) => { const p = { ...f.pantry }; delete p[id]; return { pantry: p }; })}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.t2, alignItems: 'center', justifyContent: 'center' }}>
              <T size={20}>×</T>
            </Pressable>
          </Row>
        ))}
        {!Object.keys(st.pantry).length && <Hint>Nada ainda.</Hint>}
      </View>
      <AddItem placeholder="Outro item…" onAdd={(id) => setForm((f) => ({ pantry: id in f.pantry ? f.pantry : { ...f.pantry, [id]: null } }))} />
    </>),
    () => (<>
      <H1>Quantas calorias por pessoa por dia?</H1>
      <Hint>O app aumenta ou diminui arroz, feijão e massa para chegar perto da meta.</Hint>
      {opts('kcal', [['', 'Não sei (2.000)'], [1500, '1.500'], [1800, '1.800'], [2200, '2.200'], [2500, '2.500'], [3000, '3.000']], 2)}
      <T b style={{ marginBottom: 6 }}>Outro valor</T>
      <Input keyboardType="number-pad" placeholder="ex.: 2300"
        defaultValue={[1500, 1800, 2200, 2500, 3000, ''].includes(st.kcal) ? '' : String(st.kcal)}
        onEndEditing={(e) => { const t = e.nativeEvent.text; pick('kcal', t ? Math.min(4500, Math.max(1000, +t || 2000)) : ''); }} />
    </>),
    () => (<>
      <H1>Quer comer mais proteína?</H1>
      <Hint>Bom para quem treina ou quer mais saciedade. Pode mudar depois no cardápio.</Hint>
      {opts('prot', [[0, 'Normal'], [1, 'Mais proteína'], [2, 'Bem mais proteína']])}
    </>),
  ];

  if (wi < 0) {
    const R = regionOf(st.region);
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <H1>Vamos planejar suas refeições</H1>
        <Card style={{ padding: 20 }}>
          <Basket />
          <T style={{ marginTop: 12 }}>Responda algumas perguntas rápidas, uma por tela. No fim você recebe o cardápio, a lista de compras e quanto vai gastar.</T>
        </Card>
        <Btn title="Planejar refeições" onPress={() => setWi(0)} />
        <Hint style={{ textAlign: 'center', marginTop: 12 }}>
          {S.hasPlan ? `Último plano: ${st.people} ${st.people > 1 ? 'pessoas' : 'pessoa'}, ${st.days} dias, ${R$(+st.budget)}, ${R[1]}. ` : ''}Preços médios de out/2026.
        </Hint>
        {st.bad.length > 0 && (
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Btn small alt title={st.bad.length + (st.bad.length > 1 ? ' receitas escondidas' : ' receita escondida') + ': mostrar de novo'} onPress={() => setForm({ bad: [] })} />
          </View>
        )}
      </ScrollView>
    );
  }

  const last = wi === steps.length - 1;
  return (
    <View style={{ flex: 1 }}>
      <Row style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Pressable accessibilityLabel="Voltar" onPress={() => setWi(wi - 1)}
          style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: c.line, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' }}>
          <T size={26} style={{ lineHeight: 28 }}>‹</T>
        </Pressable>
        <View style={{ flex: 1, height: 8, borderRadius: 5, backgroundColor: c.line, overflow: 'hidden' }}>
          <View style={{ width: ((wi + 1) / steps.length) * 100 + '%', height: '100%', backgroundColor: c.g }} />
        </View>
        <Hint style={{ marginTop: 0 }}>{wi + 1} de {steps.length}</Hint>
      </Row>
      <ScrollView key={wi} contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        {steps[wi]()}
      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <Btn title={last ? 'Gerar lista e cardápio' : 'Continuar'} onPress={() => {
          if (!last) setWi(wi + 1);
          else { generate(false); setWi(-1); onDone(); }
        }} />
      </View>
    </View>
  );
}
