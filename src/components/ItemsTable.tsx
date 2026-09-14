import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { InvoiceItem } from '../lib/calculations';
import { COLORS } from '../lib/constants';
import ItemRow from './ItemRow';

interface Props {
  items: InvoiceItem[];
  onUpdate: (id: number, field: keyof InvoiceItem, value: string | number) => void;
  onRemove: (id: number) => void;
  onAddRow: () => void;
}

export default function ItemsTable({ items, onUpdate, onRemove, onAddRow }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Items</Text>

      {/* Table header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 2 }]}>Size</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Qty</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Sq.Ft</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Rate ₹</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Total</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Rows */}
      {items.map((item, idx) => (
        <View
          key={item.id}
          style={[
            styles.rowWrapper,
            idx % 2 === 0 ? styles.rowEven : styles.rowOdd,
          ]}
        >
          <ItemRow item={item} onUpdate={onUpdate} onRemove={onRemove} />
        </View>
      ))}

      {/* Add row */}
      <TouchableOpacity style={styles.addBtn} onPress={onAddRow} activeOpacity={0.8}>
        <Text style={styles.addBtnText}>+ Add Row</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.woodMid,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: COLORS.woodBg,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.woodBorder,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.tableHeader,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
    gap: 8,
  },
  headerCell: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.woodBorder,
  },
  rowEven: {
    backgroundColor: COLORS.tableRowBase,
  },
  rowOdd: {
    backgroundColor: COLORS.tableRowAlt,
  },
  addBtn: {
    margin: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.woodMid,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.woodMid,
  },
});
