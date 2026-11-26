import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { COOK, CHOP, PANTRYISH, RECIPES } from '../data';
import { IT, Q, R$, W, fqOf, kcalOf, macOf, num, ppg, replaceDisliked } from '../engine';
import { useStore } from '../store';
import { Btn, Card, H1, H2, Hint, Meter, Row, Seg, Sep, Sheet, T, useC } from '../ui';

const WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const dateOf = (t0, d) => new Date(t0 + d * 864e5);
const fmt = (dt) => `${WD[dt.getDay()]}, ${dt.getDate()}/${dt.getMonth() + 1}`;

function Summary({ plan, st }) {
  const res = plan.res, over = res.cost > st.budget, pct = (res.cost / Math.max(1, st.budget)) * 100, per = res.cost / (st.people * st.days);
  const aprov = res.cost ? Math.round((res.used / res.cost) * 100) : 100;
  return (<>
    <Card kind="sum">
      <T color="#ffffffe0">Compra estimada para {st.people} {st.people > 1 ? 'pessoas' : 'pessoa'}, {st.days} dias</T>
      <T color="#fff" size={40} style={{ fontWeight: '800', lineHeight: 46 }}>{R$(res.cost)}</T>
      <T color="#ffffffe0">de {R$(+st.budget)} de orçamento</T>
      <Meter pct={pct} over={over} />
      <Row style={{ gap: 8, marginTop: 4 }}>
        {[[R$(per), 'pessoa/dia'], [num(plan.kcal), 'kcal pessoa/dia' + (st.out ? ' em casa' : '')], [aprov + '%', 'aproveitado']].map(([b, s]) => (
          <View key={s} style={{ flex: 1, backgroundColor: '#ffffff1a', borderRadius: 12, padding: 8 }}>
            <T b color="#fff" size={17}>{b}</T><T color="#ffffffe0" size={13}>{s}</T>
          </View>
        ))}
      </Row>
    </Card>
    {over ? (
      <Card kind="warn"><T><T b>O orçamento não fecha.</T> Mesmo com as receitas mais baratas que combinam com você, a compra fica {R$(res.cost - st.budget)} acima. Tente menos dias ou só uma refeição por dia{plan.swaps.length ? ' ou veja as trocas abaixo' : ''}.</T></Card>
    ) : (
      <Card kind="ok"><T>Sobram <T b>{R$(st.budget - res.cost)}</T> para frutas, lanches ou temperos. {aprov}% do que você compra vira refeição neste período; o resto (sobras de pacote de sal, óleo, arroz…) fica para a próxima compra.</T></Card>
    )}
    {plan.bsRaw > plan.bs && (
      <Card kind="tip"><T>Cozinhando {st.cook === 2 ? '1 a 2' : '3 a 4'} vezes por semana, cada preparo teria que durar mais de 4 dias. Limitei a 4 refeições por preparo; ative o <T b>modo marmita</T> para congelar e cozinhar menos vezes.</T></Card>
    )}
    {res.home.length > 0 && <Hint style={{ marginTop: -4, marginBottom: 12 }}>Você já tem em casa: {res.home.map((h) => IT[h.id].n).join(', ')}. Não entrou na conta.</Hint>}
  </>);
}

function Nutrition({ plan, st, onProt }) {
  const md = plan.res.macD, kc = plan.kcal, pc = (x) => Math.round((x / Math.max(1, kc)) * 100), tP = Math.round(plan.res.tgtP || (plan.res.tHome * 0.15) / 4);
  const rows = [
    ['Calorias', num(kc) + ' kcal', num(plan.res.tHome) + ' kcal'],
    ['Proteína', `${Math.round(md[0])} g (${pc(md[0] * 4)}%)`, (st.prot ? '' : 'cerca de ') + tP + ' g'],
    ['Carboidratos', `${Math.round(md[1])} g (${pc(md[1] * 4)}%)`, '45 a 65%'],
    ['Gorduras', `${Math.round(md[2])} g (${pc(md[2] * 9)}%)`, '20 a 35%'],
  ];
  return (
    <Card>
      <H2>Nutrição por pessoa por dia</H2>
      <Row><T mute size={13} style={{ flex: 1.1 }} /><T mute size={13} b style={{ flex: 1.3, textAlign: 'right' }}>No plano</T><T mute size={13} b style={{ flex: 1, textAlign: 'right' }}>Meta</T></Row>
      {rows.map(([a, b, m]) => (
        <View key={a}><Row style={{ paddingVertical: 8 }}><T size={15} style={{ flex: 1.1 }}>{a}</T><T size={15} style={{ flex: 1.3, textAlign: 'right' }}>{b}</T><T size={15} style={{ flex: 1, textAlign: 'right' }}>{m}</T></Row><Sep /></View>
      ))}
      {st.prot > 0 && md[0] < tP * 0.9 && (
        <Card kind="warn" style={{ marginTop: 12, marginBottom: 0 }}>
          <T>Ficou {tP - Math.round(md[0])} g abaixo da meta de proteína.{plan.res.cost >= st.budget * 0.97 ? ' O orçamento não deixou ir além: aumente o valor ou reduza os dias.' : ''}{st.restr.includes('vegano') || st.restr.includes('veg') ? ' Para quem não come carne, tofu, lentilha e grão-de-bico são as fontes mais baratas.' : ''}</T>
        </Card>
      )}
      <T b style={{ marginTop: 14, marginBottom: 6 }}>Quer mais proteína?</T>
      <Seg value={st.prot} options={[[0, 'Normal'], [1, 'Mais'], [2, 'Bem mais']]} onChange={onProt} />
      <Hint>Valores aproximados (tabela TACO), só das refeições feitas em casa. "Mais" busca 22% das calorias em proteína e "Bem mais", 30%.</Hint>
    </Card>
  );
}

function Recipe({ plan, st, bi, onClose, onDislike, onFav }) {
  const c = useC();
  const b = plan.batches[bi], r = b[0].r, serv = st.people * b.length, fq = fqOf(plan);
  const rk = Math.round(kcalOf(Object.fromEntries(Object.entries(r.ing).map(([id, g]) => [id, g * fq(id)]))));
  const rm = macOf(r.ing, fq);
  const rc = Object.entries(r.ing).reduce((s, [id, g]) => s + ppg(id) * g * fq(id), 0) * serv;
  const others = plan.chosen.filter((x) => x !== r);
  const shared = Object.keys(r.ing).filter((id) => !PANTRYISH.has(id) && others.some((o) => id in o.ing));
  const fav = st.fav.includes(r.id);
  return (<>
    <View style={{ backgroundColor: c.g2, borderRadius: 999, paddingHorizontal: 8, alignSelf: 'flex-start' }}><T size={12}>{r.c}</T></View>
    <H1 style={{ marginTop: 10 }}>{r.n}</H1>
    <Hint>Rende {serv} {serv > 1 ? 'porções' : 'porção'}{b.length > 1 && !st.marmita ? ` (${b.length} refeições)` : ''} · cerca de {rk} kcal por porção · {R$(rc)} em ingredientes</Hint>
    <Row style={{ gap: 6, marginVertical: 12 }}>
      {[[rk, 'kcal'], [Math.round(rm[0]) + ' g', 'proteína'], [Math.round(rm[1]) + ' g', 'carboidratos'], [Math.round(rm[2]) + ' g', 'gorduras']].map(([v, l]) => (
        <View key={l} style={{ flex: 1, backgroundColor: c.g2, borderRadius: 12, padding: 8 }}><T b size={16}>{v}</T><T mute size={12}>{l}</T></View>
      ))}
    </Row>
    <Hint style={{ marginTop: -4, marginBottom: 12 }}>Por porção.</Hint>
    <H2>Ingredientes</H2>
    {Object.entries(r.ing).map(([id, g]) => <T key={id}>•  {IT[id].n}: {Q(id, g * serv * fq(id))}</T>)}
    <View style={{ height: 12 }} />
    {shared.length > 0 && <Card kind="ok"><T>Aproveitamento: {shared.map((id) => IT[id].n.toLowerCase()).join(', ')} também {shared.length > 1 ? 'aparecem' : 'aparece'} em outras receitas da semana, então nada se perde.</T></Card>}
    {r.notes.length > 0 && <Card kind="tip"><T>Adaptada para você: {r.notes.join('; ')}.</T></Card>}
    <H2>Modo de preparo</H2>
    <T>{r.s}</T>
    <Row style={{ marginTop: 16 }}>
      <Btn style={{ flex: 1 }} alt title="Não gostei, trocar" onPress={() => onDislike(r)} />
      <Btn style={{ flex: 1 }} alt={!fav} title={fav ? 'Nas favoritas' : 'Favoritar'} onPress={() => onFav(r)} />
    </Row>
    <Hint>Receitas que você não gostar não voltam mais. As favoritas aparecem com mais frequência.</Hint>
  </>);
}

export default function Menu() {
  const c = useC();
  const { S, setForm, set, plan, planErr, setChosen } = useStore();
  const st = S.st;
  const [open, setOpen] = useState(null);
  const [toast, setToast] = useState(null);
  const [msg, setMsg] = useState('');

  if (planErr) return <ScrollView contentContainerStyle={{ padding: 16 }}><H1>Seu cardápio</H1><Card kind="warn"><T>{planErr}</T></Card></ScrollView>;
  if (!plan) return <ScrollView contentContainerStyle={{ padding: 16 }}><H1>Seu cardápio</H1><Card><T>Planeje suas refeições primeiro, na aba Planejar.</T></Card></ScrollView>;

  const days = [];
  plan.all.forEach((m) => (days[m.d] = days[m.d] || []).push(m));
  const fq = fqOf(plan);

  const dislike = (r) => {
    const pick = replaceDisliked(plan, { ...st, bad: [...st.bad, r.id] }, r);
    setForm((f) => ({ bad: f.bad.includes(r.id) ? f.bad : [...f.bad, r.id], fav: f.fav.filter((x) => x !== r.id) }));
    if (!pick) { setMsg('Não sobrou outra receita compatível com suas escolhas. Ela não volta nos próximos planos.'); setOpen(null); return; }
    setChosen(plan.chosen.map((x) => (x === r ? pick.id : x.id)));
    setToast({ from: r, to: pick });
    setOpen(null);
  };
  const undo = () => {
    const t = toast;
    setForm((f) => ({ bad: f.bad.filter((x) => x !== t.from.id) }));
    setChosen(plan.chosen.map((x) => (x.id === t.to.id ? t.from.id : x.id)));
    setToast(null);
  };

  let prep = null;
  if (st.marmita) {
    const weeks = []; for (let w = 0; w * 7 < st.days; w++) weeks.push(w);
    prep = weeks.map((w) => {
      const ms = plan.meals.filter((m) => m.d >= w * 7 && m.d < w * 7 + 7);
      const by = new Map(); ms.forEach((m) => by.set(m.r, (by.get(m.r) || 0) + st.people));
      const tot = {}; by.forEach((n, r) => { for (const [id, g] of Object.entries(r.ing)) tot[id] = (tot[id] || 0) + g * n * fq(id); });
      const cook = COOK.filter((id) => tot[id]).map((id) => `Cozinhe ${W(tot[id])} de ${IT[id].n.toLowerCase()} (peso cru)`);
      const chop = CHOP.filter((id) => tot[id]).map((id) => `${W(tot[id])} de ${IT[id].n.toLowerCase()}`);
      const steps = [...cook, ...(chop.length ? [`Lave e pique de uma vez: ${chop.join(', ')}`] : []), ...[...by].map(([r, n]) => `Prepare ${r.n}: ${n} porções`), 'Monte as marmitas e etiquete com o dia'];
      return (
        <Card kind="tip" key={w}>
          <H2>Dia de preparo {weeks.length > 1 ? w + 1 : ''} · {fmt(dateOf(plan.t0, w * 7))}</H2>
          <T style={{ marginBottom: 6 }}>{ms.length * st.people} marmitas. Guarde na geladeira as dos 3 primeiros dias e congele o resto; descongele na geladeira na véspera.</T>
          {steps.map((s, i) => <T key={i}>{i + 1}. {s}</T>)}
        </Card>
      );
    });
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <H1>Seu cardápio</H1>
      {toast && (
        <Card kind="ok"><Row><T style={{ flex: 1 }}>Trocamos <T b>{toast.from.n}</T> por <T b>{toast.to.n}</T>. A lista de compras já foi atualizada.</T><Btn small alt title="Desfazer" onPress={undo} /></Row></Card>
      )}
      {msg ? <Card kind="warn"><T>{msg}</T></Card> : null}
      <Summary plan={plan} st={st} />
      <Nutrition plan={plan} st={st} onProt={(v) => setForm({ prot: v }, true)} />
      {plan.swaps.length > 0 && (
        <Card kind="tip">
          <H2>Trocas que economizam</H2>
          {plan.swaps.map((s, j) => (
            <View key={j}>{j > 0 && <Sep />}
              <Row style={{ paddingVertical: 10 }}>
                <T style={{ flex: 1 }}>Troque <T b>{s.from.n}</T> ({IT[s.from.main].n.toLowerCase()}) por <T b>{s.to.n}</T> ({IT[s.to.main].n.toLowerCase()}) e economize <T b color={c.gt}>{R$(s.sv)}</T></T>
                <Btn small alt title="Trocar" onPress={() => { setToast(null); setChosen(plan.chosen.map((x, i) => (i === s.i ? s.to.id : x.id))); }} />
              </Row>
            </View>
          ))}
        </Card>
      )}
      <Btn alt title="Outra combinação" style={{ marginBottom: 12 }} onPress={() => { setToast(null); set((s) => ({ seed: s.seed + 1, chosen: null }), true); }} />
      {prep}
      {days.map((ms, d) => (
        <Card key={d}>
          <Row style={{ justifyContent: 'space-between' }}><H2>Dia {d + 1}</H2><Hint style={{ marginTop: 0, marginBottom: 8 }}>{fmt(dateOf(plan.t0, d))}</Hint></Row>
          {plan.bf && (
            <Row style={{ paddingVertical: 10 }}><T mute size={14} style={{ width: 64 }}>Café</T>
              <T style={{ flex: 1 }}>{Object.keys(plan.bf.ing).filter((i) => !['cafe', 'manteiga', 'oleo'].includes(i)).map((i) => IT[i].n).join(', ')}{plan.bf.ing.cafe ? ' e café' : ''}</T></Row>
          )}
          {plan.snacks[d] && plan.snacks[d].length > 0 && (
            <><Sep /><Row style={{ paddingVertical: 10 }}><T mute size={14} style={{ width: 64 }}>Lanche</T><T style={{ flex: 1 }}>{plan.snacks[d].map((x) => x.n).join(' e ')}</T></Row></>
          )}
          {ms.map((m, i) => {
            if (m.out) return (<View key={i}><Sep /><Row style={{ paddingVertical: 10 }}><T mute size={14} style={{ width: 64 }}>{m.k}</T><T mute style={{ flex: 1 }}>Fora de casa</T></Row></View>);
            const b = plan.batches[m.b], first = b[0] === m, dw = d % 7, src = b[0];
            const tag = st.marmita ? (dw < 3 ? 'Marmita da geladeira' : 'Marmita congelada: descongele na véspera')
              : first ? (b.length > 1 ? `Cozinhar: rende ${b.length} refeições` : 'Cozinhar')
                : `Sobra ${src.d === m.d ? 'do almoço' : src.d === m.d - 1 ? 'de ontem' : 'do dia ' + (src.d + 1)}`;
            return (
              <View key={i}><Sep />
                <Pressable accessibilityRole="button" onPress={() => setOpen(m.b)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, minHeight: 48 }}>
                  <T mute size={14} style={{ width: 64 }}>{m.k}</T>
                  <View style={{ flex: 1 }}><T b>{m.r.n}</T><T mute size={13}>{tag}</T></View>
                  <View style={{ backgroundColor: c.g2, borderRadius: 999, paddingHorizontal: 8 }}><T size={12}>{m.r.c}</T></View>
                </Pressable>
              </View>
            );
          })}
        </Card>
      ))}
      {RECIPES.length - plan.cands.length > 0 && <Hint>{RECIPES.length - plan.cands.length} de {RECIPES.length} receitas da base ficaram de fora por causa das suas restrições ou do que você não gosta.</Hint>}
      <Sheet visible={open != null && !!plan.batches[open]} onClose={() => setOpen(null)}>
        {open != null && plan.batches[open] && (
          <Recipe plan={plan} st={st} bi={open} onClose={() => setOpen(null)} onDislike={dislike}
            onFav={(r) => setForm((f) => ({ fav: f.fav.includes(r.id) ? f.fav.filter((x) => x !== r.id) : [...f.fav, r.id] }))} />
        )}
      </Sheet>
    </ScrollView>
  );
}
