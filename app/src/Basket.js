import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { useC } from './ui';

// Ilustração da sacola de feira (mesma do protótipo)
export default function Basket() {
  const c = useC();
  return (
    <View style={{ width: '100%', aspectRatio: 320 / 150 }}>
      <Svg width="100%" height="100%" viewBox="0 0 320 150">
        <Rect x="0" y="118" width="320" height="32" rx="10" fill={c.g2} />
        <Path d="M70 60h180l-18 78a10 10 0 0 1-10 8H98a10 10 0 0 1-10-8z" fill="#f2b52b" />
        <Path d="M70 60h180l-4 16H74z" fill="#d99a12" />
        <Path d="M115 60l28-44M205 60l-28-44" stroke={c.g} strokeWidth="9" strokeLinecap="round" fill="none" />
        <Circle cx="120" cy="52" r="20" fill="#d63c2f" />
        <Circle cx="114" cy="46" r="5" fill="#fff" opacity={0.45} />
        <Path d="M200 18c22 0 34 18 28 40-22 0-34-18-28-40z" fill="#3f9b63" />
        <Ellipse cx="165" cy="48" rx="26" ry="14" fill="#f6d37a" transform="rotate(-20 165 48)" />
        <Rect x="226" y="28" width="22" height="34" rx="4" fill="#fff" stroke={c.line} />
        <Path d="M231 38h12M231 45h12M231 52h8" stroke={c.mute} strokeWidth="2" />
      </Svg>
    </View>
  );
}

export function Logo() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Path d="M7 15h26l-3 17a3 3 0 0 1-3 2.5H13A3 3 0 0 1 10 32z" fill="#f2b52b" />
      <Path d="M13 15l5-8M27 15l-5-8" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Circle cx="16" cy="13" r="4" fill="#e2483a" />
      <Path d="M25 7c4 0 6 3 5 7-4 0-6-3-5-7z" fill="#7fd3a5" />
    </Svg>
  );
}

// Ícones da barra inferior
export function Icon({ name, color }) {
  const p = { stroke: color, strokeWidth: 2, fill: 'none' };
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      {name === 'plan' && <Path d="M4 6h16M4 12h10M4 18h7" {...p} />}
      {name === 'menu' && (<><Rect x="4" y="5" width="16" height="15" rx="2" {...p} /><Path d="M4 10h16M9 3v4M15 3v4" {...p} /></>)}
      {name === 'list' && (<><Path d="M5 8h14l-1.5 11h-11z" {...p} /><Path d="M9 8a3 3 0 0 1 6 0" {...p} /></>)}
      {name === 'prices' && (<><Path d="M3 12l9-9h8v8l-9 9z" {...p} /><Circle cx="16" cy="8" r="1.5" {...p} /></>)}
    </Svg>
  );
}
