import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../lib/constants';

export default function SignatureArea() {
  return (
    <View style={styles.container}>
      <View style={styles.block}>
        <View style={styles.line} />
        <Text style={styles.label}>Received By</Text>
      </View>
      <View style={styles.block}>
        <View style={styles.line} />
        <Text style={styles.label}>Signature & Stamp</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 32,
    marginTop: 32,
    marginBottom: 8,
  },
  block: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  line: {
    height: 48,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.woodMid,
    width: '100%',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
