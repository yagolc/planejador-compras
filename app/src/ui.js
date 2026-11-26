import React, { createContext, useContext } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Verde-feira, branco, tomate como acento (mesma paleta do protótipo)
const LIGHT = { bg: '#f6f4ee', card: '#ffffff', ink: '#18201b', mute: '#5d6a62', line: '#e3e0d6', g: '#17583a', gt: '#17583a', g2: '#e3f0e8', t: '#d63c2f', t2: '#fde9e6', y: '#f2b52b', y2: '#fff4d6' };
const DARK = { bg: '#101412', card: '#1a201d', ink: '#eef2ee', mute: '#9fb0a6', line: '#2a332e', g: '#17583a', gt: '#7fd3a5', g2: '#1f3a2c', t: '#d63c2f', t2: '#3a1f1b', y: '#f2b52b', y2: '#3a3218' };

const ThemeCtx = createContext(LIGHT);
export function ThemeProvider({ children }) {
  const dark = useColorScheme() === 'dark';
  return <ThemeCtx.Provider value={dark ? DARK : LIGHT}>{children}</ThemeCtx.Provider>;
}
export const useC = () => useContext(ThemeCtx);

export function T({ style, mute, b, size, color, children, ...p }) {
  const c = useC();
  return (
    <Text
      style={[{ color: color || (mute ? c.mute : c.ink), fontSize: size || 16, lineHeight: (size || 16) * 1.4 }, b && { fontWeight: '700' }, style]}
      {...p}
    >
      {children}
    </Text>
  );
}
export const H1 = ({ children, style }) => <T size={28} b style={[{ lineHeight: 32, marginTop: 6, marginBottom: 12, fontWeight: '800' }, style]}>{children}</T>;
export const H2 = ({ children, style }) => <T size={18} b style={[{ marginBottom: 8 }, style]}>{children}</T>;
export const Hint = ({ children, style }) => <T mute size={14} style={[{ marginTop: 4 }, style]}>{children}</T>;

export function Card({ kind, style, children }) {
  const c = useC();
  const bg = { warn: c.t2, ok: c.g2, tip: c.y2, sum: c.g }[kind] || c.card;
  return (
    <View style={[{ backgroundColor: bg, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: kind ? 0 : 1, borderColor: c.line }, style]}>
      {children}
    </View>
  );
}

export function Btn({ title, onPress, alt, small, style, disabled }) {
  const c = useC();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { backgroundColor: alt ? c.g2 : c.t, borderRadius: 14, minHeight: small ? 44 : 52, paddingHorizontal: small ? 14 : 18, justifyContent: 'center', alignItems: 'center', opacity: pressed || disabled ? 0.7 : 1 },
        style,
      ]}
    >
      <T b size={small ? 15 : 17} color={alt ? c.ink : '#fff'} style={{ fontWeight: '800', textAlign: 'center' }}>{title}</T>
    </Pressable>
  );
}

// Opção grande de toque (assistente)
export function Opt({ label, on, onPress, center, style }) {
  const c = useC();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[{ borderWidth: 2, borderColor: on ? c.g : c.line, backgroundColor: on ? c.g : c.card, borderRadius: 16, paddingVertical: 14, paddingHorizontal: center ? 4 : 16, minHeight: 60, justifyContent: 'center' }, style]}
    >
      <T b size={18} color={on ? '#fff' : c.ink} style={{ textAlign: center ? 'center' : 'left' }}>{label}</T>
    </Pressable>
  );
}

export function Grid({ cols = 1, children }) {
  const items = React.Children.toArray(children);
  const rows = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return (
    <View style={{ gap: 10, marginVertical: 14 }}>
      {rows.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
          {r.map((it, j) => <View key={j} style={{ flex: 1 }}>{it}</View>)}
          {r.length < cols && Array.from({ length: cols - r.length }).map((_, j) => <View key={'e' + j} style={{ flex: 1 }} />)}
        </View>
      ))}
    </View>
  );
}

export function Chip({ label, on, no, onPress }) {
  const c = useC();
  const bg = on ? (no ? c.t : c.g) : c.bg;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={{ borderWidth: 1, borderColor: on ? bg : c.line, backgroundColor: bg, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14, minHeight: 42, justifyContent: 'center' }}
    >
      <T size={15} color={on ? '#fff' : c.ink}>{label}</T>
    </Pressable>
  );
}
export const Chips = ({ children }) => <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>{children}</View>;

export function Check({ on, onPress, label, children }) {
  const c = useC();
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={onPress} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 12 }}>
      <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: on ? c.g : c.mute, backgroundColor: on ? c.g : 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        {on && <T b color="#fff" size={15} style={{ lineHeight: 18 }}>✓</T>}
      </View>
      <View style={{ flex: 1 }}>{label ? <T b>{label}</T> : null}{children}</View>
    </Pressable>
  );
}

export function Input({ style, ...p }) {
  const c = useC();
  return (
    <TextInput
      placeholderTextColor={c.mute}
      style={[{ fontSize: 16, borderWidth: 1, borderColor: c.line, borderRadius: 12, backgroundColor: c.bg, color: c.ink, minHeight: 48, paddingHorizontal: 14, paddingVertical: 10 }, style]}
      {...p}
    />
  );
}

export function Seg({ value, options, onChange }) {
  const c = useC();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.bg, borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 4, gap: 4 }}>
      {options.map(([v, l]) => (
        <Pressable key={String(v)} onPress={() => onChange(v)} accessibilityRole="button" accessibilityState={{ selected: value === v }}
          style={{ flex: 1, minHeight: 44, borderRadius: 9, justifyContent: 'center', alignItems: 'center', backgroundColor: value === v ? c.card : 'transparent' }}>
          <T b={value === v}>{l}</T>
        </Pressable>
      ))}
    </View>
  );
}

export function Meter({ pct, over }) {
  return (
    <View style={{ height: 16, borderRadius: 9, backgroundColor: '#ffffff33', marginTop: 14, marginBottom: 8, overflow: 'hidden' }}>
      <View style={{ width: Math.max(0, Math.min(100, pct)) + '%', height: '100%', backgroundColor: over ? '#ff7a6e' : '#f2b52b', borderRadius: 9 }} />
    </View>
  );
}

export const Tag = ({ label, kind }) => {
  const c = useC();
  return (
    <View style={{ backgroundColor: kind === 'e' ? c.t2 : kind === 'n' ? c.y2 : c.g2, borderRadius: 6, paddingHorizontal: 6, alignSelf: 'flex-start' }}>
      <T size={12}>{label}</T>
    </View>
  );
};

// Folha que sobe de baixo (receita, nota fiscal)
export function Sheet({ visible, onClose, children }) {
  const c = useC();
  const ins = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#0007', justifyContent: 'flex-end' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar" />
        <View style={{ backgroundColor: c.card, maxHeight: '90%', borderTopLeftRadius: 22, borderTopRightRadius: 22 }}>
          <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 24 + ins.bottom }} keyboardShouldPersistTaps="handled">
            <Pressable onPress={onClose} accessibilityLabel="Fechar" style={{ alignSelf: 'flex-end', width: 44, height: 44, borderRadius: 22, backgroundColor: c.g2, alignItems: 'center', justifyContent: 'center' }}>
              <T size={22}>×</T>
            </Pressable>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export const Row = ({ children, style }) => <View style={[{ flexDirection: 'row', gap: 10, alignItems: 'center' }, style]}>{children}</View>;
export const Sep = () => { const c = useC(); return <View style={{ height: 1, backgroundColor: c.line }} />; };
