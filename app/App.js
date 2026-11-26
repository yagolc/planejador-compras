import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/store';
import { ThemeProvider, T, useC } from './src/ui';
import { Icon, Logo } from './src/Basket';
import Plan from './src/screens/Plan';
import Menu from './src/screens/Menu';
import List from './src/screens/List';
import Prices from './src/screens/Prices';

const TABS = [['plan', 'Planejar'], ['menu', 'Cardápio'], ['list', 'Lista'], ['prices', 'Preços']];

function Main() {
  const c = useC();
  const ins = useSafeAreaInsets();
  const { S } = useStore();
  const [tab, setTab] = useState('plan');
  const [planKey, setPlanKey] = useState(0);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style="light" />
      <View style={{ backgroundColor: c.g, paddingTop: ins.top + 12, paddingBottom: 12, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Logo />
        <View>
          <T b color="#fff" size={20} style={{ fontWeight: '800', lineHeight: 22 }}>Cesta</T>
          <T color="#ffffffd9" size={13}>planejador de compras</T>
        </View>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {tab === 'plan' && <Plan key={planKey} onDone={() => setTab('menu')} />}
        {tab === 'menu' && <Menu />}
        {tab === 'list' && <List />}
        {tab === 'prices' && <Prices />}
      </KeyboardAvoidingView>
      <View style={{ flexDirection: 'row', backgroundColor: c.card, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 6, paddingBottom: 6 + ins.bottom, paddingHorizontal: 6 }}>
        {TABS.map(([k, l]) => {
          const disabled = (k === 'menu' || k === 'list') && !S.hasPlan;
          const on = tab === k;
          return (
            <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: on, disabled }} disabled={disabled}
              onPress={() => { if (k === 'plan' && tab === 'plan') setPlanKey(planKey + 1); setTab(k); }}
              style={{ flex: 1, alignItems: 'center', gap: 2, minHeight: 54, justifyContent: 'center', opacity: disabled ? 0.35 : 1 }}>
              <Icon name={k} color={on ? c.gt : c.mute} />
              <T size={13} b color={on ? c.gt : c.mute}>{l}</T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StoreProvider>
          <Main />
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
