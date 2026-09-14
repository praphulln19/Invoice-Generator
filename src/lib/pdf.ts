import { Platform } from 'react-native';
import { InvoiceItem, getSqFt, getTotalPrice, formatINR, getGrandTotal } from './calculations';
import { COMPANY } from './constants';

export interface InvoiceMetadata {
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
}

/** Load the design.png as a base64 data URI for embedding in PDF HTML */
async function getLogoBase64(): Promise<string> {
  try {
    if (Platform.OS !== 'web') {
      const { Asset } = await import('expo-asset');
      const asset = Asset.fromModule(require('../../assets/design.png'));
      await asset.downloadAsync();
      const { readAsStringAsync, EncodingType } = await import('expo-file-system');
      const b64 = await readAsStringAsync(asset.localUri!, {
        encoding: EncodingType.Base64,
      });
      return `data:image/png;base64,${b64}`;
    } else {
      // Web: use a relative path — works in browser
      return '/assets/design.png';
    }
  } catch {
    return ''; // fallback: no logo
  }
}

async function buildInvoiceHTML(
  items: InvoiceItem[],
  meta: InvoiceMetadata,
): Promise<string> {
  const logoSrc = await getLogoBase64();

  const rowsHtml = items
    .map((item) => {
      const sqft = getSqFt(item.size);
      const total = getTotalPrice(item);
      return `
        <tr>
          <td style="font-weight:600; font-size:13px;">${item.size || '—'}</td>
          <td style="text-align:right;">${item.qty || 0}</td>
          <td style="text-align:right;">${sqft > 0 ? sqft.toFixed(2) : '—'}</td>
          <td style="text-align:right;">${item.rate ? '₹' + item.rate : '—'}</td>
          <td style="text-align:right; font-weight:600;">${total > 0 ? formatINR(total) : '—'}</td>
        </tr>`;
    })
    .join('');

  const grandTotal = getGrandTotal(items);
  const logoHtml = logoSrc
    ? `<img src="${logoSrc}" style="width:64px;height:64px;object-fit:contain;border-radius:8px;margin-right:14px;" />`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#fff; color:#1A1008; }

  header { background:#6B3A1F; color:#fff; padding:20px 28px; display:flex; justify-content:space-between; align-items:center; }
  .header-left { display:flex; align-items:center; }
  .brand-name { font-size:22px; font-weight:800; letter-spacing:0.5px; }
  .header-meta { font-size:11px; line-height:1.7; text-align:right; }
  .invoice-tag { background:#9B5A30; color:#fff; text-align:center; padding:8px; font-weight:700; font-size:14px; letter-spacing:2px; }

  main { padding:24px 28px; }
  .section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#6B3A1F; margin-bottom:10px; padding-bottom:4px; border-bottom:2px solid #D4A87A; }
  .customer-grid { display:flex; gap:24px; margin-bottom:24px; flex-wrap:wrap; }
  .customer-grid div { flex:1; min-width:140px; }
  .customer-grid label { font-size:10px; font-weight:600; color:#6B5B4E; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:4px; }
  .customer-grid span { font-size:14px; font-weight:600; color:#1A1008; display:block; padding:6px 0; border-bottom:1px solid #D4A87A; }

  table { width:100%; border-collapse:collapse; margin-bottom:16px; }
  thead tr { background:#5C2E0A; color:#fff; }
  thead th { padding:10px 12px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
  thead th:not(:first-child) { text-align:right; }
  tbody tr:nth-child(even) { background:#FDF0E6; }
  tbody tr:nth-child(odd) { background:#FFFBF7; }
  tbody td { padding:9px 12px; font-size:13px; border-bottom:1px solid #EDD9B8; }
  tbody td:not(:first-child) { text-align:right; }

  .total-bar { background:#6B3A1F; color:#fff; text-align:right; padding:12px 20px; font-size:16px; font-weight:700; border-radius:4px; margin-bottom:32px; }

  .sig-area { display:flex; justify-content:space-between; padding:0 20px; margin-top:24px; }
  .sig-block { width:40%; text-align:center; }
  .sig-line { border-top:1.5px solid #6B3A1F; padding-top:6px; margin-top:48px; font-size:11px; font-weight:600; color:#6B5B4E; text-transform:uppercase; letter-spacing:0.5px; }

  footer { text-align:center; font-size:10px; color:#6B5B4E; padding:16px; border-top:1px solid #EDD9B8; margin-top:16px; }
</style>
</head>
<body>
  <header>
    <div class="header-left">
      ${logoHtml}
      <div>
        <div class="brand-name">${COMPANY.name}</div>
      </div>
    </div>
    <div class="header-meta">
      <div>${COMPANY.address}</div>
      <div>${COMPANY.area}</div>
      <div>${COMPANY.city}</div>
      <div>📞 ${COMPANY.phone1} | 📞 ${COMPANY.phone2}</div>
      <div>${COMPANY.website}</div>
    </div>
  </header>
  <div class="invoice-tag">BILL INVOICE</div>

  <main>
    <div class="section-title" style="margin-top:20px;">Bill To</div>
    <div class="customer-grid">
      <div><label>Customer Name</label><span>${meta.customerName || '—'}</span></div>
      <div><label>Bill No.</label><span>${meta.invoiceNumber || '—'}</span></div>
      <div><label>Bill Date</label><span>${meta.invoiceDate || '—'}</span></div>
    </div>

    <div class="section-title">Items</div>
    <table>
      <thead>
        <tr>
          <th>Size</th>
          <th>Quantity</th>
          <th>Sq. Ft.</th>
          <th>Rate (₹)</th>
          <th>Total Price</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>

    <div class="total-bar">Total Price = ${formatINR(grandTotal)}</div>

    <div class="sig-area">
      <div class="sig-block"><div class="sig-line">Received By</div></div>
      <div class="sig-block"><div class="sig-line">Signature &amp; Stamp</div></div>
    </div>
  </main>

  <footer>© 2026 Supraon Enterprises · All Rights Reserved · Darbhanga, Bihar</footer>
</body>
</html>`;
}

export async function generateAndSharePDF(
  items: InvoiceItem[],
  meta: InvoiceMetadata,
): Promise<void> {
  const html = await buildInvoiceHTML(items, meta);
  const filename = meta.customerName
    ? `${meta.invoiceNumber}_${meta.customerName}.pdf`
    : `${meta.invoiceNumber}.pdf`;

  if (Platform.OS === 'web') {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 500);
    }
    return;
  }

  // Native: load expo-print / expo-sharing on demand — not needed until export
  const [Print, Sharing] = await Promise.all([
    import('expo-print'),
    import('expo-sharing'),
  ]);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Share ${filename}`,
      UTI: 'com.adobe.pdf',
    });
  }
}

export async function buildPDFBlob(
  items: InvoiceItem[],
  meta: InvoiceMetadata,
): Promise<{ html: string }> {
  const html = await buildInvoiceHTML(items, meta);
  return { html };
}
