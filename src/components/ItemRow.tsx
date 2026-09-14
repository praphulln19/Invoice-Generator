import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { InvoiceItem } from '../lib/calculations';
import { COLORS, SIZES } from '../lib/constants';
import { getSqFt, getTotalPrice, formatINR } from '../lib/calculations';

interface Props {
  item: InvoiceItem;
  onUpdate: (id: number, field: keyof InvoiceItem, value: string | number) => void;
  onRemove: (id: number) => void;
}

export default function ItemRow({ item, onUpdate, onRemove }: Props) {
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isCustom, setIsCustom] = useState(
    item.size !== '' && !SIZES.includes(item.size),
  );

  const sqft = getSqFt(item.size);
  const totalPrice = getTotalPrice(item);

  function handleSizeSelect(size: string) {
    setShowSizePicker(false);
    if (size === '__custom__') {
      setIsCustom(true);
      onUpdate(item.id, 'size', '');
    } else {
      setIsCustom(false);
      onUpdate(item.id, 'size', size);
    }
  }

  const displaySize = isCustom ? 'Custom…' : (item.size || '— Select Size —');

  return (
    <View style={styles.row}>
      {/* Size */}
      <View style={styles.cellSize}>
        <Text style={styles.cellLabel}>Size</Text>
        <TouchableOpacity
          style={styles.sizePicker}
          onPress={() => setShowSizePicker(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.sizePickerText, !item.size && styles.placeholder]}>
            {displaySize}
          </Text>
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>
        {isCustom && (
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            value={item.size === '__custom__' ? '' : item.size}
            onChangeText={(v) => onUpdate(item.id, 'size', v)}
            placeholder="e.g. 90*44"
            placeholderTextColor={COLORS.mutedText}
          />
        )}

        {/* Size picker modal */}
        <Modal visible={showSizePicker} transparent animationType="slide">
          <TouchableOpacity
            style={styles.backdrop}
            onPress={() => setShowSizePicker(false)}
          />
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Size</Text>
              <TouchableOpacity onPress={() => setShowSizePicker(false)}>
                <Text style={styles.pickerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                style={[styles.pickerItem, !item.size && styles.pickerItemSelected]}
                onPress={() => handleSizeSelect('')}
              >
                <Text style={styles.pickerItemText}>— Select Size —</Text>
              </TouchableOpacity>
              {SIZES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pickerItem, item.size === s && styles.pickerItemSelected]}
                  onPress={() => handleSizeSelect(s)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      item.size === s && styles.pickerItemSelectedText,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.pickerItem, isCustom && styles.pickerItemSelected]}
                onPress={() => handleSizeSelect('__custom__')}
              >
                <Text style={styles.pickerItemText}>Custom…</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </View>

      {/* Quantity */}
      <View style={styles.cellNum}>
        <Text style={styles.cellLabel}>Qty</Text>
        <TextInput
          style={[styles.input, styles.numInput]}
          value={item.qty ? String(item.qty) : ''}
          onChangeText={(v) => onUpdate(item.id, 'qty', parseFloat(v) || 0)}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={COLORS.mutedText}
        />
      </View>

      {/* Sq. Ft. */}
      <View style={styles.cellNum}>
        <Text style={styles.cellLabel}>Sq.Ft</Text>
        <View style={styles.readOnlyCell}>
          <Text style={styles.readOnlyText}>
            {sqft > 0 ? sqft.toFixed(2) : '—'}
          </Text>
        </View>
      </View>

      {/* Rate */}
      <View style={styles.cellNum}>
        <Text style={styles.cellLabel}>Rate ₹</Text>
        <TextInput
          style={[styles.input, styles.numInput]}
          value={item.rate ? String(item.rate) : ''}
          onChangeText={(v) => onUpdate(item.id, 'rate', parseFloat(v) || 0)}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={COLORS.mutedText}
        />
      </View>

      {/* Total */}
      <View style={styles.cellNum}>
        <Text style={styles.cellLabel}>Total</Text>
        <View style={styles.readOnlyCell}>
          <Text style={[styles.readOnlyText, styles.totalText]}>
            {totalPrice > 0 ? formatINR(totalPrice) : '—'}
          </Text>
        </View>
      </View>

      {/* Delete */}
      <TouchableOpacity
        style={styles.delBtn}
        onPress={() => onRemove(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.delBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.woodBorder,
    gap: 8,
    flexWrap: 'wrap',
  },
  cellLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: COLORS.mutedText,
    marginBottom: 4,
  },
  cellSize: {
    flex: 2,
    minWidth: 100,
  },
  cellNum: {
    flex: 1,
    minWidth: 60,
  },
  sizePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  sizePickerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
    flex: 1,
  },
  placeholder: {
    color: COLORS.mutedText,
    fontWeight: '400',
  },
  chevron: {
    fontSize: 12,
    color: COLORS.woodMid,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.ink,
    backgroundColor: COLORS.white,
  },
  numInput: {
    textAlign: 'right',
  },
  readOnlyCell: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 7,
    backgroundColor: COLORS.woodBg,
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
  },
  readOnlyText: {
    fontSize: 12,
    color: COLORS.mutedText,
    textAlign: 'right',
  },
  totalText: {
    fontWeight: '700',
    color: COLORS.woodDark,
    fontSize: 11,
  },
  delBtn: {
    marginTop: 20,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDE8D8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
  },
  delBtnText: {
    fontSize: 12,
    color: COLORS.woodMid,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '65%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.woodBorder,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.woodDark,
  },
  pickerClose: {
    fontSize: 16,
    color: COLORS.mutedText,
    padding: 4,
  },
  pickerItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5E8D0',
  },
  pickerItemSelected: {
    backgroundColor: COLORS.woodBg,
  },
  pickerItemText: {
    fontSize: 15,
    color: COLORS.ink,
  },
  pickerItemSelectedText: {
    fontWeight: '700',
    color: COLORS.woodMid,
  },
});
