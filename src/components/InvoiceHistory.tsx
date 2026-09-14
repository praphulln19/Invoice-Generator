import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { COLORS } from '../lib/constants';
import { formatBytes, formatSavedDate } from '../lib/calculations';
import { getSupabaseClient } from '../lib/supabase';
import { SkeletonRows } from './InvoiceHistorySkeleton';

interface InvoiceRecord {
  id: string;
  filename: string;
  size_bytes: number;
  customer_name: string;
  invoice_number: string;
  invoice_date: string;
  created_at: string;
}

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [status, setStatus] = useState('Loading saved invoices…');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setStatus('Loading saved invoices…');

    const client = await getSupabaseClient();
    if (!client) {
      setStatus('Supabase not configured — check your environment variables.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await client
        .from('invoices')
        .select('id, filename, size_bytes, customer_name, invoice_number, invoice_date, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const list: InvoiceRecord[] = Array.isArray(data) ? data : [];
      setInvoices(list);
      setStatus(
        list.length === 0
          ? 'No saved invoices yet.'
          : `${list.length} saved invoice${list.length === 1 ? '' : 's'}.`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Error loading invoice history:', message);
      setStatus('Could not load invoice history. Check your Supabase setup.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function downloadInvoice(id: string) {
    const client = await getSupabaseClient();
    if (!client) {
      Alert.alert('Error', 'Supabase is not configured.');
      return;
    }
    try {
      const { data, error } = await client.functions.invoke('create-invoice-download', {
        body: { id },
      });
      if (error || data?.error || !data?.url) {
        throw new Error(data?.error || error?.message || 'Failed to create download link');
      }
      Linking.openURL(data.url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert('Error', message || 'Failed to create download link.');
    }
  }

  async function deleteInvoice(id: string, displayName: string) {
    Alert.alert('Delete Invoice', `Delete "${displayName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const client = await getSupabaseClient();
          if (!client) return;
          setStatus('Deleting invoice…');
          try {
            const { data, error } = await client.functions.invoke('delete-invoice', {
              body: { id },
            });
            if (error || data?.error) {
              throw new Error(data?.error || error?.message || 'Failed to delete invoice');
            }
            await load();
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setStatus('Could not delete invoice. Please try again.');
            Alert.alert('Error', message || 'Failed to delete invoice.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Invoice History</Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={load}
          disabled={loading}
        >
          <Text style={styles.refreshBtnText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <Text style={styles.statusText}>{status}</Text>

      {/* Rows */}
      {loading && invoices.length === 0 ? (
        <SkeletonRows count={3} />
      ) : (
        invoices.map((inv) => (
          <View key={inv.id} style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.filename} numberOfLines={1}>{inv.filename}</Text>
              <Text style={styles.rowMeta}>
                {inv.customer_name || '-'} · {inv.invoice_date || '-'}
              </Text>
              <Text style={styles.rowMeta}>
                {formatSavedDate(inv.created_at)} · {formatBytes(inv.size_bytes)}
              </Text>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity
                style={styles.dlBtn}
                onPress={() => downloadInvoice(inv.id)}
              >
                <Text style={styles.dlBtnText}>↓ Download</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.delBtn}
                onPress={() => deleteInvoice(inv.id, inv.filename)}
              >
                <Text style={styles.delBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.woodBg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.woodBorder,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.woodMid,
  },
  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
    backgroundColor: COLORS.white,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.woodDark,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.mutedText,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.woodBorder,
    alignItems: 'center',
    gap: 8,
  },
  rowLeft: {
    flex: 1,
  },
  filename: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 3,
  },
  rowMeta: {
    fontSize: 11,
    color: COLORS.mutedText,
    lineHeight: 16,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dlBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.woodMid,
  },
  dlBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  delBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FDE8D8',
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
  },
  delBtnText: {
    fontSize: 13,
  },
});
