import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../lib/constants';
import { formatINR } from '../lib/calculations';

interface Props {
  grandTotal: number;
}

export default function TotalBar({ grandTotal }: Props) {
  return (
    <View style={styles.bar}>
      <Text style={styles.label}>Total Price</Text>
      <Text style={styles.amount}>{formatINR(grandTotal)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.woodMid,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  amount: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
