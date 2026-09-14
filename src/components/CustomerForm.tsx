import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { COLORS } from '../lib/constants';
import { formatDisplayDate, getTodayISO } from '../lib/calculations';
import type RNDateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string; // DD-MM-YY display format
  onChangeName: (v: string) => void;
  onChangeNumber: (v: string) => void;
  onChangeDate: (display: string) => void;
}

export default function CustomerForm({
  customerName,
  invoiceNumber,
  invoiceDate,
  onChangeName,
  onChangeNumber,
  onChangeDate,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [DateTimePicker, setDateTimePicker] = useState<typeof RNDateTimePicker | null>(null);

  // Lazy-load DateTimePicker to avoid issues on web
  async function openPicker() {
    if (Platform.OS === 'web') {
      // On web, just use a simple prompt or skip the native picker
      setShowPicker(true);
      return;
    }
    if (!DateTimePicker) {
      try {
        const mod = await import('@react-native-community/datetimepicker');
        setDateTimePicker(() => mod.default);
      } catch {
        // Fallback if not available
      }
    }
    setShowPicker(true);
  }

  /** Convert DD-MM-YY display → Date object */
  function displayToDate(): Date {
    if (!invoiceDate) return new Date();
    const parts = invoiceDate.split('-');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = 2000 + parseInt(parts[2], 10);
      return new Date(y, m, d);
    }
    return new Date();
  }

  function handleNativeDateChange(_event: unknown, selected?: Date) {
    setShowPicker(Platform.OS === 'ios'); // Keep open on iOS (spinner style)
    if (selected) {
      const iso = selected.toISOString().split('T')[0];
      onChangeDate(formatDisplayDate(iso));
    }
  }

  function handleWebDateChange(isoStr: string) {
    if (isoStr) {
      onChangeDate(formatDisplayDate(isoStr));
    }
    setShowPicker(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Bill To</Text>
      <View style={styles.grid}>

        {/* Customer Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Customer Name</Text>
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={onChangeName}
            placeholder="e.g. Raj Constructions"
            placeholderTextColor={COLORS.mutedText}
          />
        </View>

        {/* Bill No */}
        <View style={styles.field}>
          <Text style={styles.label}>Bill No.</Text>
          <TextInput
            style={styles.input}
            value={invoiceNumber}
            onChangeText={onChangeNumber}
            placeholder="BILL-2026-001"
            placeholderTextColor={COLORS.mutedText}
          />
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Bill Date</Text>
          <TouchableOpacity
            style={styles.dateRow}
            onPress={openPicker}
            activeOpacity={0.8}
          >
            <Text style={invoiceDate ? styles.dateText : styles.datePlaceholder}>
              {invoiceDate || 'DD-MM-YY'}
            </Text>
            <Text style={styles.calIcon}>📅</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Native Date Picker */}
      {showPicker && Platform.OS !== 'web' && DateTimePicker && (
        <DateTimePicker
          value={displayToDate()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleNativeDateChange}
        />
      )}

      {/* Web fallback — simple modal with HTML date input */}
      {showPicker && Platform.OS === 'web' && (
        <Modal transparent animationType="fade" visible={showPicker}>
          <TouchableOpacity
            style={styles.backdrop}
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.webPickerBox} onStartShouldSetResponder={() => true}>
              <Text style={styles.webPickerTitle}>Select Date</Text>
              {/* We use a native HTML date input via View/TextInput workaround */}
              <TextInput
                style={styles.webDateInput}
                placeholder={getTodayISO()}
                placeholderTextColor={COLORS.mutedText}
                onChangeText={(val) => {
                  // Accepts YYYY-MM-DD
                  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                    handleWebDateChange(val);
                  }
                }}
                maxLength={10}
                keyboardType="default"
              />
              <Text style={styles.webPickerHint}>Format: YYYY-MM-DD (e.g. 2026-06-20)</Text>
              <TouchableOpacity
                style={styles.webPickerClose}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.webPickerCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.woodMid,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.woodBorder,
    paddingBottom: 4,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  field: {
    flex: 1,
    minWidth: 120,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.ink,
    backgroundColor: COLORS.white,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: COLORS.white,
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    color: COLORS.ink,
    flex: 1,
  },
  datePlaceholder: {
    fontSize: 14,
    color: COLORS.mutedText,
    flex: 1,
  },
  calIcon: {
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webPickerBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  webPickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.woodDark,
    marginBottom: 12,
  },
  webDateInput: {
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.ink,
    backgroundColor: COLORS.woodBg,
  },
  webPickerHint: {
    fontSize: 11,
    color: COLORS.mutedText,
    marginTop: 6,
    marginBottom: 12,
  },
  webPickerClose: {
    backgroundColor: COLORS.woodMid,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  webPickerCloseText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
