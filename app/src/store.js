import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyPrices, makePlan } from './engine';

const KEY = 'cesta.v1';
export const DEFAULT_FORM = {
  prot: 0, bad: [], fav: [], region: 'QXD', budget: 250, out: 0, cook: 7, snk: 0, people: 2, days: 7,
  mpd: 2, bf: true, marmita: false, restr: [], cuis: [], dis: [], kcal: '', pantry: {},
};
const DEFAULT = {
  st: DEFAULT_FORM, // respostas do assistente
  precos: {}, // preços editados na aba Preços
  obs: {}, // preço pago ÷ estimado, vindo das notas fiscais
  cartobs: {}, // preço pago ÷ estimado, vindo do carrinho
  cart: {}, // quanto pagou em cada item da lista atual
  checked: [], // itens já no carrinho
  hist: [], // compras registradas por nota fiscal
  pts: 0, // pontos por notas e preços confirmados
  seed: 1,
  chosen: null, // ids das receitas do plano atual (guarda as trocas)
  hasPlan: false,
};

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [S, setS] = useState(null);
  const [plan, setPlan] = useState(null);
  const [planErr, setPlanErr] = useState(null);
  const ref = useRef(null);

  const compute = useCallback((s) => {
    applyPrices({ region: s.st.region, precos: s.precos, obs: s.obs, cartobs: s.cartobs });
    if (!s.hasPlan) { setPlan(null); setPlanErr(null); return; }
    const p = makePlan(s.st, s.seed, s.chosen);
    if (p.error) { setPlan(null); setPlanErr(p.error); } else { setPlan(p); setPlanErr(null); }
  }, []);

  useEffect(() => {
    (async () => {
      let s = DEFAULT;
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) { const v = JSON.parse(raw); s = { ...DEFAULT, ...v, st: { ...DEFAULT_FORM, ...(v.st || {}) } }; }
      } catch (e) {}
      ref.current = s; setS(s); compute(s);
    })();
  }, [compute]);

  // patch: objeto ou função (estado atual) => objeto. recompute: refaz o plano (preço/região/receitas mudaram)
  const set = useCallback((patch, recompute) => {
    const cur = ref.current;
    const next = { ...cur, ...(typeof patch === 'function' ? patch(cur) : patch) };
    ref.current = next; setS(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
    if (recompute) compute(next);
    return next;
  }, [compute]);
  const setForm = useCallback((patch, recompute) => set((s) => ({ st: { ...s.st, ...(typeof patch === 'function' ? patch(s.st) : patch) } }), recompute), [set]);

  // Gera um plano novo (zera carrinho e checks)
  const generate = useCallback((keepList) => {
    set((s) => ({ hasPlan: true, seed: Date.now() % 100000, chosen: null, ...(keepList ? {} : { checked: [], cart: {} }) }), true);
  }, [set]);
  // Fixa as receitas escolhidas (depois de uma troca)
  const setChosen = useCallback((ids) => set({ chosen: ids }, true), [set]);

  if (!S) return null;
  return <Ctx.Provider value={{ S, set, setForm, plan, planErr, generate, setChosen }}>{children}</Ctx.Provider>;
}
