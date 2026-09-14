// Pure calculation functions — no DOM, no React, fully testable

export interface InvoiceItem {
  id: number;
  size: string;
  qty: number;
  rate: number;
  sqft: number;
}

/** Parse size string like "84*42" → sqft = (L × B) / 144, rounded to 2dp */
export function getSqFt(size: string): number {
  const m = size.match(/(\d+(?:\.\d+)?)\*(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  const L = parseFloat(m[1]);
  const B = parseFloat(m[2]);
  return +((L * B) / 144).toFixed(2);
}

export function getTotalPrice(item: InvoiceItem): number {
  const sf = getSqFt(item.size);
  return +(item.qty * item.rate * sf).toFixed(2);
}

export function getGrandTotal(items: InvoiceItem[]): number {
  return +items.reduce((s, i) => s + getTotalPrice(i), 0).toFixed(2);
}

/** ₹ 1,23,456.78 */
export function formatINR(n: number): string {
  return '₹ ' + n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatSavedDate(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  const yy = y.slice(-2);
  return `${d}-${m}-${yy}`;
}

export function getTodayISO(): string {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}
