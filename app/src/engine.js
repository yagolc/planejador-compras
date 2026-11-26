// Motor do planejador: mesma lógica do protótipo web, sem DOM.
import {
  RAW, REG, SUBS, MINOR, RESTR, COOK_BASE, PANTRYISH, RECIPES, SNACKS,
  OUT_KCAL, BREAKFAST, MAC, PMSET,
} from './data';

export const R$ = (v) =>
  'R$ ' + (Math.round(v * 100) / 100).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const num = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const W = (g) =>
  g >= 1000 ? (Math.round(g / 10) / 100).toString().replace('.', ',') + ' kg' : Math.round(g) + ' g';
export const Q = (id, g) => (id === 'ovos' ? Math.max(1, Math.ceil(g / 50 - 1e-9)) + ' un' : W(g));

// Itens da tabela de preços
const BASE = {};
export const IT = {};
RAW.forEach(([id, n, cat, packs, kcal, tags, src, step]) => {
  BASE[id] = packs.map((p) => p[1]);
  IT[id] = { id, n, cat, packs: packs.map((p) => ({ q: p[0], p: p[1], l: p[2] || '' })), kcal, tags: tags ? tags.split(' ') : [], src, step };
});

const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
export const regionOf = (code) => REG.find((r) => r[0] === code) || REG[0];

// Aplica região, preços digitados na aba Preços e preços reais pagos (nota fiscal e carrinho)
export function applyPrices({ region, precos = {}, obs = {}, cartobs = {} }) {
  const R = regionOf(region), rg = R[2], ov = R[3] || {};
  for (const id in IT) {
    const fs = [...(obs[id] || []), ...(cartobs[id] != null ? [cartobs[id]] : [])];
    const f = fs.length ? avg([1, ...fs]) : 1;
    IT[id].adj = f !== 1;
    IT[id].rsrc = ov[id] ? 'd' : R[0] === 'SP' ? IT[id].src : 'e';
    IT[id].packs.forEach((pk, i) => {
      pk.p = precos[id] && precos[id][i] != null
        ? precos[id][i]
        : +((ov[id] && ov[id][i] != null ? ov[id][i] : BASE[id][i] * rg) * f).toFixed(2);
    });
  }
}

export const findItem = (t) => {
  t = t.trim().toLowerCase();
  if (!t) return null;
  const all = Object.values(IT);
  return all.find((i) => i.n.toLowerCase() === t) || all.find((i) => i.n.toLowerCase().includes(t));
};

function rng(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const ppg = (id) => Math.min(...IT[id].packs.map((p) => p.p / p.q));

// Escolhe a combinação de embalagens mais barata que cobre a quantidade
function buy(id, need) {
  const it = IT[id];
  if (it.step) {
    const n = Math.ceil(need / it.step - 1e-9), g = n * it.step;
    return { cost: (g / 1000) * it.packs[0].p, desc: W(g) + ' a granel', g };
  }
  const ps = [...it.packs].sort((a, b) => a.q - b.q), s = ps[0], L = ps[ps.length - 1];
  let best = null;
  for (let nb = 0; nb <= Math.ceil(need / L.q - 1e-9); nb++) {
    const ns = ps.length > 1 ? Math.ceil(Math.max(0, need - nb * L.q) / s.q - 1e-9) : 0;
    if (ps.length === 1 && nb * L.q < need - 1e-9) continue;
    const cost = nb * L.p + ns * s.p * (ps.length > 1);
    if (!best || cost < best.cost - 1e-9) best = { cost, nb, ns };
  }
  const parts = [];
  if (best.nb) parts.push(best.nb + ' × ' + L.l);
  if (ps.length > 1 && best.ns) parts.push(best.ns + ' × ' + s.l);
  return { cost: best.cost, desc: parts.join(' + '), g: best.nb * L.q + (ps.length > 1 ? best.ns * s.q : 0) };
}

function resolve(ing, blocked, dis, soft) {
  const out = {}, notes = [];
  for (const [id, g] of Object.entries(ing)) {
    let use = id;
    const bad = (x) => IT[x].tags.some((t) => blocked.has(t));
    if (bad(use)) use = (SUBS[id] || []).find((s) => !bad(s) && !dis.has(s)) || null;
    if (use && dis.has(use)) use = null;
    if (!use) {
      if (soft || g <= MINOR) { notes.push('sem ' + IT[id].n.toLowerCase()); continue; }
      return null;
    }
    if (use !== id) notes.push(IT[use].n.toLowerCase() + ' no lugar de ' + IT[id].n.toLowerCase());
    out[use] = (out[use] || 0) + g;
  }
  return { ing: out, notes };
}

export const macOf = (ing, f = () => 1) =>
  Object.entries(ing).reduce((a, [id, g]) => {
    const m = MAC[id] || [0, 0, 0];
    return a.map((v, k) => v + (m[k] * g * f(id)) / 100);
  }, [0, 0, 0]);
const pmKc = (ing) => Object.entries(ing).reduce((s, [id, g]) => s + (PMSET.has(id) ? (IT[id].kcal * g) / 100 : 0), 0);
export const BASEF = new Set([...COOK_BASE]);
const baseKc = (ing) => Object.entries(ing).reduce((s, [id, g]) => s + (BASEF.has(id) ? (IT[id].kcal * g) / 100 : 0), 0);
export const fqOf = (plan) => (id) => (!plan ? 1 : BASEF.has(id) ? plan.bm : PMSET.has(id) ? plan.pm : 1);
export const kcalOf = (ing) => Object.entries(ing).reduce((s, [id, g]) => s + (IT[id].kcal * g) / 100, 0);
const costOf = (ing) => Object.entries(ing).reduce((s, [id, g]) => s + ppg(id) * g, 0);
const PROT = new Set(['frango', 'carne_moida', 'linguica', 'salmao', 'tilapia', 'camarao', 'atum', 'ovos', 'tofu', 'lentilha', 'grao', 'feijao_preto', 'feijao', 'queijo', 'abacate']);
const mainOf = (r) =>
  Object.entries(r.ing)
    .filter(([id]) => !PANTRYISH.has(id))
    .sort((a, b) => PROT.has(b[0]) - PROT.has(a[0]))
    .filter((e, i, a) => !PROT.has(a[0][0]) || PROT.has(e[0]))
    .sort((a, b) => ppg(b[0]) * b[1] - ppg(a[0]) * a[1])[0][0];
const overlap = (r, set) => Object.keys(r.ing).filter((id) => !PANTRYISH.has(id) && set.has(id)).length;

// Monta o plano: escolhe receitas, distribui nas refeições e cabe no orçamento
export function build(st, seed) {
  const blocked = new Set(st.restr.flatMap((r) => RESTR.find((x) => x[0] === r)[2])), dis = new Set(st.dis);
  const P = st.people, D = st.days, target = +st.kcal || 2000, rnd = rng(seed);
  const cands = RECIPES.filter((r) => !st.bad.includes(r.id))
    .map((r) => { const x = resolve(r.ing, blocked, dis); return x && { ...r, ...x }; })
    .filter(Boolean);
  if (!cands.length) return { error: 'Nenhuma receita da nossa base combina com essas restrições e ingredientes evitados. Tente tirar algum ingrediente da lista de “não gosto”.' };
  cands.forEach((r) => {
    r.cps = costOf(r.ing); r.kc = kcalOf(r.ing); r.main = mainOf(r);
    r.pd = (macOf(r.ing)[0] * 4) / Math.max(1, r.kc);
    r.score = (st.prot ? r.pd * 12 * st.prot : 0) + (st.cuis.includes(r.c) ? 3 : 0) + (st.fav.includes(r.id) ? 2.5 : 0) + rnd() * 1.5;
  });
  const bf = st.bf ? resolve(BREAKFAST, blocked, dis, true) : null;
  const t0 = Date.now();
  const all = [];
  for (let d = 0; d < D; d++) {
    const wd = new Date(t0 + d * 864e5).getDay();
    if (st.mpd === 2) all.push({ d, wd, k: 'Almoço' }, { d, wd, k: 'Jantar' });
    else all.push({ d, wd, k: 'Jantar' });
  }
  // Refeições fora: primeiro almoços de segunda a sexta, depois jantares de sexta e sábado
  const prio = (m) => (m.k === 'Almoço' && m.wd >= 1 && m.wd <= 5 ? 0 : m.k === 'Jantar' && (m.wd === 5 || m.wd === 6) ? 1 : 2);
  for (let w = 0; w * 7 < D; w++) {
    const wk = all.filter((m) => m.d >= w * 7 && m.d < w * 7 + 7);
    const n = Math.min(wk.length, Math.round((st.out * wk.filter((m) => m.k === 'Jantar').length) / 7));
    wk.map((m, i) => [prio(m), i, m]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).slice(0, n).forEach((x) => (x[2].out = true));
  }
  const meals = all.filter((m) => !m.out);
  if (!meals.length) return { error: 'Com todas as refeições fora de casa, não sobra nada para cozinhar. Diminua as refeições fora.' };
  const perWeek = meals.length / (D / 7), bsRaw = Math.max(1, Math.round(perWeek / st.cook)), bs = st.marmita ? bsRaw : Math.min(4, bsRaw);
  const off = st.mpd === 2 && bs === 2 && !st.out ? 1 : 0;
  meals.forEach((m, i) => (m.b = Math.floor((i + off) / bs)));
  const snacks = [];
  const sOk = SNACKS.map(([n, ing]) => { const x = resolve(ing, blocked, dis); return x && Object.keys(x.ing).length ? { n, ...x } : null; }).filter(Boolean);
  if (st.prot) sOk.sort((a, b) => macOf(b.ing)[0] / Math.max(1, kcalOf(b.ing)) - macOf(a.ing)[0] / Math.max(1, kcalOf(a.ing)));
  for (let d = 0; d < D; d++) {
    snacks[d] = [];
    for (let j = 0; j < st.snk && sOk.length; j++) snacks[d].push(sOk[(d * st.snk + j) % sOk.length]);
  }
  const tHome = Math.max(800, target - (all.filter((m) => m.out).length * OUT_KCAL) / D);
  const nb = meals[meals.length - 1].b + 1, k = Math.min(cands.length, Math.max(3, Math.min(12, Math.ceil(nb * 0.75))));
  // Aproveitamento total: pontos por reaproveitar ingredientes das receitas já escolhidas
  const ingSet = (arr) => new Set(arr.flatMap((r) => Object.keys(r.ing)));
  const fit = (c, arr) => c.score + Math.min(2.4, 0.6 * overlap(c, ingSet(arr)));
  let chosen = [];
  while (chosen.length < k) {
    const pool = cands.filter((c) => !chosen.includes(c));
    chosen.push(pool.reduce((a, b) => (fit(b, chosen) > fit(a, chosen) ? b : a)));
  }
  const pantry = st.pantry;
  const evalWith = (arr) => {
    const allIng = [...meals.map((m) => arr[m.b % arr.length].ing), ...(bf ? Array(D).fill(bf.ing) : []), ...snacks.flat().map((x) => x.ing)];
    const sumD = (f) => allIng.reduce((s, ing) => s + f(ing), 0) / D;
    const prot0 = sumD((i) => macOf(i)[0]), protPM = sumD((i) => macOf(i, (id) => (PMSET.has(id) ? 1 : 0))[0]);
    const tgtP = st.prot ? (tHome * (st.prot === 1 ? 0.22 : 0.3)) / 4 : 0;
    const pm = st.prot && protPM > 0 ? Math.min(2, Math.max(1, 1 + (tgtP - prot0) / protPM)) : 1;
    const dayK = sumD(kcalOf) + sumD(pmKc) * (pm - 1), baseK = sumD(baseKc);
    const bm = baseK > 0 ? Math.min(2.5, Math.max(0.5, (baseK + tHome - dayK) / baseK)) : 1;
    const fx = (id) => (BASEF.has(id) ? bm : PMSET.has(id) ? pm : 1);
    const macD = [0, 1, 2].map((kk) => sumD((i) => macOf(i, fx)[kk]));
    const need = {}, uses = {};
    const add = (ing, mult, rid) => {
      for (const [id, g] of Object.entries(ing)) {
        need[id] = (need[id] || 0) + g * mult * fx(id);
        if (rid != null) (uses[id] = uses[id] || new Set()).add(rid);
      }
    };
    meals.forEach((m) => add(arr[m.b % arr.length].ing, P, arr[m.b % arr.length].id));
    if (bf) add(bf.ing, P * D, null);
    snacks.flat().forEach((x) => add(x.ing, P, null));
    const items = [], home = [];
    for (const [id, g] of Object.entries(need)) {
      const have = id in pantry ? (pantry[id] == null ? Infinity : pantry[id]) : 0, left = Math.max(0, g - have);
      if (left <= 1e-6) { home.push({ id, need: g }); continue; }
      items.push({ id, need: left, total: g, have: Math.min(have, g), uses: uses[id] ? uses[id].size : 0, ...buy(id, left) });
    }
    const cost = items.reduce((s, i) => s + i.cost, 0), used = items.reduce((s, i) => s + ppg(i.id) * i.need, 0);
    return { items, home, cost, used, bm, pm, macD, tgtP, tHome, kcal: Math.round(dayK + baseK * (bm - 1)) };
  };
  let res = evalWith(chosen), guard = 0;
  while (res.cost > st.budget && guard++ < 300) {
    const worst = chosen.reduce((a, b) => (b.cps > a.cps ? b : a)), rest = chosen.filter((c) => c !== worst);
    const opts = cands.filter((c) => !chosen.includes(c) && c.cps < worst.cps - 1e-6);
    if (opts.length) {
      const pick = opts.reduce((a, b) => (fit(b, rest) - 0.5 * b.cps > fit(a, rest) - 0.5 * a.cps ? b : a));
      chosen[chosen.indexOf(worst)] = pick;
    } else if (chosen.length > Math.min(3, cands.length)) chosen.splice(chosen.indexOf(worst), 1);
    else break;
    res = evalWith(chosen);
  }
  return { cands, chosen, meals, all, snacks, bs, bsRaw, bf, evalWith, res, t0 };
}

// Calcula resultado, sobras e trocas inteligentes
export function finalize(p, st) {
  p.res = p.evalWith(p.chosen);
  p.meals.forEach((m) => (m.r = p.chosen[m.b % p.chosen.length]));
  p.batches = [];
  p.meals.forEach((m) => (p.batches[m.b] = p.batches[m.b] || []).push(m));
  p.bm = p.res.bm; p.pm = p.res.pm; p.kcal = p.res.kcal;
  const best = [];
  p.chosen.forEach((r, i) => {
    let top = null;
    p.cands.filter((c) => !p.chosen.includes(c) && !st.bad.includes(c.id)).forEach((c) => {
      const arr = [...p.chosen]; arr[i] = c;
      const sv = p.res.cost - p.evalWith(arr).cost;
      if (sv >= 3 && (!top || sv > top.sv)) top = { i, from: r, to: c, sv };
    });
    if (top) best.push(top);
  });
  p.swaps = best.sort((a, b) => b.sv - a.sv).slice(0, 3);
  return p;
}

// Plano completo; se houver receitas salvas (trocas feitas), restaura a escolha
export function makePlan(st, seed, chosenIds) {
  const p = build(st, seed);
  if (p.error) return p;
  if (chosenIds && chosenIds.length) {
    const byId = Object.fromEntries(p.cands.map((c) => [c.id, c]));
    const restored = chosenIds.map((id) => byId[id]).filter(Boolean);
    if (restored.length === chosenIds.length) p.chosen = restored;
  }
  return finalize(p, st);
}

// Troca uma receita de que a pessoa não gostou pela melhor que ainda cabe no orçamento
export function replaceDisliked(plan, st, r) {
  const i = plan.chosen.indexOf(r);
  const pool = plan.cands.filter((c) => !plan.chosen.includes(c) && !st.bad.includes(c.id));
  if (!pool.length) return null;
  const opts = pool.map((c) => { const a = [...plan.chosen]; a[i] = c; return { c, cost: plan.evalWith(a).cost }; });
  const fits = opts.filter((o) => o.cost <= st.budget);
  return (fits.length ? fits.reduce((a, b) => (b.c.score > a.c.score ? b : a)) : opts.reduce((a, b) => (b.cost < a.cost ? b : a))).c;
}

// ---------- nota fiscal (NFC-e) ----------
const UF = { 11: 'RO', 12: 'AC', 13: 'AM', 14: 'RR', 15: 'PA', 16: 'AP', 17: 'TO', 21: 'MA', 22: 'PI', 23: 'CE', 24: 'RN', 25: 'PB', 26: 'PE', 27: 'AL', 28: 'SE', 29: 'BA', 31: 'MG', 32: 'ES', 33: 'RJ', 35: 'SP', 41: 'PR', 42: 'SC', 43: 'RS', 50: 'MS', 51: 'MT', 52: 'GO', 53: 'DF' };
export function parseNota(txt) {
  const m = String(txt).replace(/\s/g, '').match(/\d{44}/);
  if (!m) return null;
  const k = m[0];
  return {
    k,
    uf: UF[+k.slice(0, 2)] || '?',
    mod: k.slice(20, 22),
    cnpj: k.slice(6, 20).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5'),
    when: k.slice(4, 6) + '/20' + k.slice(2, 4),
    link: /^https:\/\//i.test(String(txt).trim()) ? String(txt).trim() : null,
  };
}

export const LEVELS = [[0, 'Iniciante'], [100, 'Olho no preço'], [300, 'Caçador de ofertas'], [800, 'Mestre da feira']];
