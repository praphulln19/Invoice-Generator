import React, { useState, Suspense } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import InvoiceHeader from '../../src/components/InvoiceHeader';
import CustomerForm from '../../src/components/CustomerForm';
import ItemsTable from '../../src/components/ItemsTable';
import TotalBar from '../../src/components/TotalBar';
import SignatureArea from '../../src/components/SignatureArea';
import ActionButtons from '../../src/components/ActionButtons';
import InvoiceHistorySkeleton from '../../src/components/InvoiceHistorySkeleton';
import { useInvoiceItems } from '../../src/hooks/useInvoiceItems';
import { COLORS } from '../../src/lib/constants';
import { getTodayISO, formatDisplayDate } from '../../src/lib/calculations';

// Deferred: not needed for first paint, so keep them out of the main chunk.
const InvoiceHistory = React.lazy(() => import('../../src/components/InvoiceHistory'));

export default function InvoiceScreen() {
  const { items, addRow, removeRow, updateField, clearAll, grandTotal } = useInvoiceItems();

  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('BILL-2026-001');
  const [invoiceDate, setInvoiceDate] = useState(formatDisplayDate(getTodayISO()));
  const [saving, setSaving] = useState(false);
  const [historyKey, setHistoryKey] = useState(0); // force-refresh history

  async function handleSavePDF() {
    setSaving(true);
    try {
      const meta = { invoiceNumber, customerName, invoiceDate };
      const filename = customerName
        ? `${invoiceNumber}_${customerName}.pdf`
        : `${invoiceNumber}.pdf`;

      // Load the PDF generator on demand — not needed until the user saves
      const { generateAndSharePDF, buildPDFBlob } = await import('../../src/lib/pdf');

      // Generate & share PDF locally (expo-print on native, browser print on web)
      await generateAndSharePDF(items, meta);

      // Save to Supabase (same Edge Function as before)
      const { getSupabaseClient } = await import('../../src/lib/supabase');
      const client = await getSupabaseClient();
      if (client) {
        try {
          const { html } = await buildPDFBlob(items, meta);

          const { data, error } = await client.functions.invoke('save-invoice', {
            body: {
              pdfData: btoa(unescape(encodeURIComponent(html))),
              filename,
              invoiceNumber,
              customerName,
              invoiceDate,
            },
          });

          if (error || (data as { error?: string })?.error) {
            console.warn('Supabase save error:', error || (data as { error?: string })?.error);
          } else {
            setHistoryKey((k) => k + 1);
          }
        } catch (supaErr) {
          console.warn('Could not save to Supabase:', supaErr);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert('Error', message || 'Failed to generate PDF.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <InvoiceHeader />

        <CustomerForm
          customerName={customerName}
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          onChangeName={setCustomerName}
          onChangeNumber={setInvoiceNumber}
          onChangeDate={setInvoiceDate}
        />

        <ItemsTable
          items={items}
          onUpdate={updateField}
          onRemove={removeRow}
          onAddRow={addRow}
        />

        <TotalBar grandTotal={grandTotal} />

        <SignatureArea />

        <ActionButtons
          onSavePDF={handleSavePDF}
          onClearAll={clearAll}
          saving={saving}
        />

        <Suspense fallback={<InvoiceHistorySkeleton />}>
          <InvoiceHistory key={historyKey} />
        </Suspense>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Supraon Enterprises · All Rights Reserved · Darbhanga, Bihar
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.woodBg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.woodBorder,
    marginTop: 16,
    marginHorizontal: 16,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.mutedText,
    textAlign: 'center',
    lineHeight: 16,
  },
});
