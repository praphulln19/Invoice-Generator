import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../lib/constants';

interface Props {
  onSavePDF: () => void;
  onClearAll: () => void;
  saving: boolean;
}

export default function ActionButtons({ onSavePDF, onClearAll, saving }: Props) {
  function handleClear() {
    Alert.alert(
      'Clear All',
      'Clear all items and reset the invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: onClearAll },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.primaryBtn, saving && styles.btnDisabled]}
        onPress={onSavePDF}
        disabled={saving}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>
          {saving ? '⏳ Saving...' : '📥 Save & Download PDF'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={handleClear}
        disabled={saving}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryBtnText}>🗑 Clear All</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.woodMid,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: COLORS.woodDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 180,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.woodBorder,
    minWidth: 100,
  },
  secondaryBtnText: {
    color: COLORS.woodDark,
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
