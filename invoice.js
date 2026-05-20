/** @type {{ id: number, size: string, qty: number, rate: number, sqft: number }[]} */
let items = [];
let nextId = 1;

function formatINR(/** @type {number} */ n) {
    return '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function addRow() {
    items.push({ id: nextId++, size: '', qty: 0, rate: 0, sqft: 0 });
    render();
}

function removeRow(/** @type {number} */ id) {
    items = items.filter(i => i.id !== id);
    render();
}

/** Parse size string like "84*42" and return sqft = (L * B) / 144, rounded to 2 dp */
function getSqFt(/** @type {string} */ size) {
    const m = size.match(/(\d+(?:\.\d+)?)\*(\d+(?:\.\d+)?)/);
    if (!m) return 0;
    const L = parseFloat(m[1]);
    const B = parseFloat(m[2]);
    return +((L * B) / 144).toFixed(2);
}

function getTotalPrice(/** @type {typeof items[0]} */ item) {
    const sf = getSqFt(item.size);
    return +(item.qty * item.rate * sf).toFixed(2);
}

function render() {
    const tbody = document.getElementById('items-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    items.forEach((item) => {
        const sqft = getSqFt(item.size);
        const totalPrice = getTotalPrice(item);
        const tr = document.createElement('tr');

        const sizes = [
            // 84* : 42 down to 32, step -2
            '84*42', '84*40', '84*38', '84*36', '84*34', '84*32',
            // 81* : 42 down to 32, step -2
            '81*42', '81*40', '81*38', '81*36', '81*34', '81*32',
            // 78* : 38 down to 30, step -2
            '78*38', '78*36', '78*34', '78*32', '78*30',
        ];

        const optionsHtml = sizes.map(s =>
            `<option value="${s}" ${item.size === s ? 'selected' : ''}>${s}</option>`
        ).join('');

        const isCustom = item.size !== '' && !sizes.includes(item.size);

        tr.innerHTML = `
      <td data-label="Size" style="min-width:200px; text-align:center;">
        <select onchange="handleSizeSelect(${item.id}, this.value)" style="width:100%; text-align:center; margin-bottom:${isCustom ? '6px' : '0'};">
          <option value="" ${item.size === '' ? 'selected' : ''}>— Select Size —</option>
          ${optionsHtml}
          <option value="__custom__" ${isCustom ? 'selected' : ''}>Custom…</option>
        </select>
        ${isCustom ? `<input type="text" value="${item.size}" placeholder="e.g. 90*44-28"
          oninput="updateField(${item.id},'size',this.value)"
          style="width:100%; margin-top:4px;" />` : ''}
      </td>
      <td data-label="Quantity" style="text-align:center;">
        <input type="number" value="${item.qty || ''}" min="0" placeholder="0"
          oninput="updateField(${item.id},'qty',+this.value)"
          style="text-align:center;" />
      </td>
      <td class="sqft-cell" data-label="Sq. Ft." style="text-align:center;"><span class="val-wrap">${sqft > 0 ? sqft.toFixed(2) : '—'}</span></td>
      <td data-label="Rate (₹)" style="text-align:center;">
        <input type="number" value="${item.rate || ''}" min="0" placeholder="0"
          oninput="updateField(${item.id},'rate',+this.value)"
          style="text-align:center;" />
      </td>
      <td class="total-cell" data-label="Total Price"><span class="val-wrap">${totalPrice > 0 ? formatINR(totalPrice) : '—'}</span></td>
      <td class="del-cell" data-label="">
        <button class="del-btn" onclick="removeRow(${item.id})" title="Remove row">✕</button>
      </td>
    `;
        tbody.appendChild(tr);
    });

    updateTotal();
}

function handleSizeSelect(/** @type {number} */ id, /** @type {string} */ value) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (value === '__custom__') {
        item.size = '__custom__';
    } else {
        item.size = value;
    }
    render();
}

function updateField(/** @type {number} */ id, /** @type {string} */ field, /** @type {any} */ value) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    // For size field, if user typed something, store it directly (not '__custom__')
    if (field === 'size' && value !== '__custom__') {
        item.size = value;
    } else {
        (item)[field] = value;
    }
    // refresh sqft cell and total price cell of this row
    const rows = document.querySelectorAll('#items-body tr');
    const idx = items.indexOf(item);
    if (rows[idx]) {
        const sqftCell = rows[idx].querySelector('.sqft-cell');
        const sf = getSqFt(item.size);
        if (sqftCell) sqftCell.textContent = sf > 0 ? sf.toFixed(2) : '—';

        const totalCell = rows[idx].querySelector('.total-cell');
        const tp = getTotalPrice(item);
        if (totalCell) totalCell.textContent = tp > 0 ? formatINR(tp) : '—';
    }
    updateTotal();
}

function updateTotal() {
    const grand = items.reduce((s, i) => s + getTotalPrice(i), 0);
    const el = document.getElementById('grand-total');
    if (el) el.textContent = formatINR(grand);
}

function updateInvoiceNumber(/** @type {string} */ val) {
    const el = document.getElementById('invoice-number-display');
    if (el) el.textContent = val || '—';
}

function resetForm() {
    items = [];
    nextId = 1;
    const custName = /** @type {HTMLInputElement} */ (document.getElementById('cust-name'));
    if (custName) custName.value = '';
    render();
    addRow(); addRow(); addRow();
    generateNextInvoiceNumber();
}

function clearAll() {
    if (!confirm('Clear all items and reset the invoice?')) return;
    resetForm();
}

// ── PRINT PDF (browser print dialog) ──
// ── POPULATE PRINT TEMPLATE ──
function populatePrintTemplate() {
    const custName = (document.getElementById('cust-name')?.value || '').trim() || '—';
    const invoiceNo = (document.getElementById('invoice-no')?.value || '').trim() || '—';
    const invoiceDate = (document.getElementById('invoice-date')?.value || '').trim() || '—';

    const printCustName = document.getElementById('print-cust-name');
    const printInvoiceNo = document.getElementById('print-invoice-no');
    const printInvoiceDate = document.getElementById('print-invoice-date');

    if (printCustName) printCustName.textContent = custName;
    if (printInvoiceNo) printInvoiceNo.textContent = invoiceNo;
    if (printInvoiceDate) printInvoiceDate.textContent = invoiceDate;

    const tbody = document.getElementById('print-items-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    let validItemCount = 0;
    items.forEach(function (item) {
        // Skip items that have no size, quantity, and rate
        if (!item.size && !item.qty && !item.rate) {
            return;
        }

        let sizeText = item.size;
        if (sizeText === '__custom__') {
            sizeText = 'Custom Size';
        }

        validItemCount++;
        const sqft = getSqFt(item.size);
        const totalPrice = getTotalPrice(item);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;">${validItemCount}</td>
            <td style="text-align: left; font-weight: 600;">${sizeText || '—'}</td>
            <td style="text-align: center;">${item.qty || 0}</td>
            <td style="text-align: center;">${sqft > 0 ? sqft.toFixed(2) : '—'}</td>
            <td style="text-align: center;">${item.rate > 0 ? formatINR(item.rate).replace('₹ ', '') : '—'}</td>
            <td style="text-align: center; font-weight: 600; white-space: nowrap;">${totalPrice > 0 ? formatINR(totalPrice) : '—'}</td>
        `;
        tbody.appendChild(tr);
    });

    if (validItemCount === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="6" style="text-align: center; color: var(--muted); font-style: italic; padding: 16px;">No items added</td>
        `;
        tbody.appendChild(tr);
    }

    const grand = items.reduce((s, i) => s + getTotalPrice(i), 0);
    const printGrandTotal = document.getElementById('print-grand-total');
    if (printGrandTotal) printGrandTotal.textContent = formatINR(grand);
}

// Register browser print hook
window.addEventListener('beforeprint', populatePrintTemplate);

// ── PRINT PDF (browser print dialog fallback) ──
function downloadPDF() {
    populatePrintTemplate();
    window.print();
}


// ── SUPABASE CLIENT (config-aware, handles async Vercel /api/config fetch) ──
let supabaseClient = null;

// Resolves once we know whether Supabase is configured.
// On Vercel: waits for the /api/config fetch (injected in index.html) to set globals.
// Locally:   resolves almost immediately (globals already set by supabase-config.js).
const supabaseReady = new Promise(function (resolve) {
    function tryInit() {
        const url = window.SUPROAN_SUPABASE_URL  || '';
        const key = window.SUPROAN_SUPABASE_ANON_KEY || '';
        const valid =
            url && key &&
            !url.includes('YOUR_PROJECT_REF') &&
            !key.includes('YOUR_SUPABASE_ANON_KEY');
        if (valid && window.supabase) {
            supabaseClient = window.supabase.createClient(url, key);
        }
        resolve();
    }
    // Poll for up to 3 s for the async fetch to populate the globals
    var deadline = Date.now() + 3000;
    function poll() {
        var url = window.SUPROAN_SUPABASE_URL || '';
        if ((url && !url.includes('YOUR_PROJECT_REF')) || Date.now() >= deadline) {
            tryInit();
        } else {
            setTimeout(poll, 50);
        }
    }
    poll();
});

// ── HELPERS ──
function setStatus(/** @type {string} */ message) {
    const el = document.getElementById('history-status');
    if (el) el.textContent = message;
}

function formatBytes(/** @type {number} */ bytes) {
    if (!Number.isFinite(bytes)) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSavedDate(/** @type {string | Date} */ value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getInvoiceFilename() {
    const invNoEl = document.getElementById('invoice-no');
    const custNameEl = document.getElementById('cust-name');
    const invNo = (invNoEl ? invNoEl.value.trim() : 'Bill') || 'Bill';
    const cust = (custNameEl ? custNameEl.value.trim() : '') || '';
    return cust ? `${invNo}_${cust}.pdf` : `${invNo}.pdf`;
}

function getInvoiceMetadata() {
    const invNoEl = /** @type {HTMLInputElement} */ (document.getElementById('invoice-no'));
    const custNameEl = /** @type {HTMLInputElement} */ (document.getElementById('cust-name'));
    const dateEl = /** @type {HTMLInputElement} */ (document.getElementById('invoice-date'));

    return {
        invoiceNumber: invNoEl ? invNoEl.value.trim() : '',
        customerName: custNameEl ? custNameEl.value.trim() : '',
        invoiceDate: dateEl ? dateEl.value.trim() : ''
    };
}

function blobToBase64(/** @type {Blob} */ blob) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onloadend = function () {
            const result = String(reader.result || '');
            resolve(result.split(',')[1] || '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function downloadBlob(/** @type {Blob} */ blob, /** @type {string} */ filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

async function saveInvoicePdf(/** @type {Blob} */ pdfBlob, /** @type {string} */ filename) {
    await supabaseReady;
    if (!supabaseClient) {
        throw new Error('Supabase is not configured. Update supabase-config.js first.');
    }

    const pdfData = await blobToBase64(pdfBlob);
    const { data, error } = await supabaseClient.functions.invoke('save-invoice', {
        body: {
            pdfData,
            filename,
            ...getInvoiceMetadata()
        }
    });

    if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to save invoice');
    }

    return data;
}

// Override the print-only downloadPDF with the save-and-download version
downloadPDF = async function () {
    const filename = getInvoiceFilename();
    const button = /** @type {HTMLButtonElement} */ (document.getElementById('btn-download-pdf'));
    const originalButtonText = button ? button.textContent : '';

    if (!window.html2pdf) {
        alert('PDF generator failed to load. Please check your internet connection and try again.');
        return;
    }

    let cloneContainer = null;
    const loadingOverlay = document.getElementById('pdf-loading-overlay');

    try {
        if (button) {
            button.disabled = true;
            button.textContent = 'Saving...';
        }
        if (loadingOverlay) loadingOverlay.classList.add('active');
        setStatus('Generating PDF layout...');

        // 1. Populate the hidden DOM template with current data
        populatePrintTemplate();
        const originalTemplate = document.getElementById('invoice-print-template');
        
        // 2. Deep clone the template so we can manipulate it without breaking the original
        const clone = originalTemplate.cloneNode(true);
        
        // 3. Create a wrapper container to isolate it from the main UI
        cloneContainer = document.createElement('div');
        
        // Force the container to be in the normal flow, but hidden BEHIND everything else.
        // It must have a positive bounding box for html2canvas to render it.
        Object.assign(cloneContainer.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '794px',
            zIndex: '-9999',
            backgroundColor: '#ffffff',
            display: 'block',
            opacity: '1'
        });
        
        // 4. Force the clone itself to be visibly drawn (overriding the stylesheet display: none)
        clone.style.display = 'block';
        clone.style.margin = '0';
        
        // 5. Add to document so it receives a real layout context from the browser engine
        cloneContainer.appendChild(clone);
        document.body.appendChild(cloneContainer);

        // 6. Yield to browser to let it physically paint the new DOM nodes before capture
        await new Promise(resolve => setTimeout(resolve, 150));

        const options = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        setStatus('Saving invoice to Supabase...');

        // 7. Generate PDF from the explicitly visible clone
        const pdfBlob = await window.html2pdf()
            .set(options)
            .from(clone)
            .outputPdf('blob');

        // Always trigger the file download first so the user gets their PDF
        downloadBlob(pdfBlob, filename);

        // Try to save to Supabase database/storage, but don't block the download if it fails
        try {
            await saveInvoicePdf(pdfBlob, filename);
            setStatus('Invoice saved. Refreshing history...');
            await loadInvoiceHistory();
            resetForm(); // Auto-empty the form and generate new bill number for the next customer
        } catch (supabaseError) {
            console.warn('Could not save invoice to Supabase:', supabaseError);
            setStatus('PDF downloaded. Invoice history save skipped (local dev/unconfigured).');
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        setStatus('Could not generate PDF. Please try again.');
        alert(error.message || 'Failed to generate PDF.');
    } finally {
        // Cleanup the temporary DOM clone
        if (cloneContainer && cloneContainer.parentNode) {
            cloneContainer.parentNode.removeChild(cloneContainer);
        }

        if (loadingOverlay) loadingOverlay.classList.remove('active');

        if (button) {
            button.disabled = false;
            button.textContent = originalButtonText || 'Save & Download PDF';
        }
    }
};

async function loadInvoiceHistory() {
    await supabaseReady;
    const tbody = document.getElementById('invoice-history-body');
    if (!tbody) return;

    if (!supabaseClient) {
        setStatus('Supabase not configured — check your environment variables.');
        return;
    }

    setStatus('Loading saved invoices...');
    tbody.innerHTML = '';

    try {
        const { data, error } = await supabaseClient
            .from('invoices')
            .select('id, filename, size_bytes, customer_name, invoice_number, invoice_date, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const invoices = Array.isArray(data) ? data : [];
        if (invoices.length === 0) {
            setStatus('No saved invoices yet.');
            return;
        }

        invoices.forEach(function (invoice) {
            const tr = document.createElement('tr');
            const safeDisplayName = invoice.filename.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            tr.innerHTML = `
                <td data-label="Invoice"><div class="history-filename">${invoice.filename}</div></td>
                <td data-label="Customer">${invoice.customer_name || '-'}</td>
                <td class="history-date" data-label="Bill Date">${invoice.invoice_date || '-'}</td>
                <td class="history-date" data-label="Created">${formatSavedDate(invoice.created_at)}</td>
                <td class="num" data-label="Size">${formatBytes(invoice.size_bytes)}</td>
                <td class="history-actions-cell">
                    <div class="history-actions">
                        <button class="history-link" type="button" onclick="downloadSavedInvoice('${invoice.id}')">Download</button>
                        <button class="history-delete-btn" type="button" onclick="deleteInvoice('${invoice.id}', '${safeDisplayName}')">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        setStatus(`${invoices.length} saved invoice${invoices.length === 1 ? '' : 's'}.`);
    } catch (error) {
        console.error('Error loading invoice history:', error);
        setStatus('Could not load invoice history. Check your Supabase setup.');
    }
}

async function downloadSavedInvoice(/** @type {string} */ id) {
    await supabaseReady;
    if (!supabaseClient) {
        alert('Supabase is not configured.');
        return;
    }

    try {
        const { data, error } = await supabaseClient.functions.invoke('create-invoice-download', {
            body: { id }
        });

        if (error || data?.error || !data?.url) {
            throw new Error(data?.error || error?.message || 'Failed to create download link');
        }

        window.open(data.url, '_blank', 'noopener');
    } catch (error) {
        console.error('Error creating download link:', error);
        alert(error.message || 'Failed to create download link.');
    }
}

async function deleteInvoice(/** @type {string} */ id, /** @type {string} */ displayName) {
    if (!confirm(`Delete ${displayName}?`)) return;

    await supabaseReady;
    if (!supabaseClient) {
        alert('Supabase is not configured.');
        return;
    }

    setStatus('Deleting invoice...');
    try {
        const { data, error } = await supabaseClient.functions.invoke('delete-invoice', {
            body: { id }
        });

        if (error || data?.error) {
            throw new Error(data?.error || error?.message || 'Failed to delete invoice');
        }

        await loadInvoiceHistory();
        generateNextInvoiceNumber();
    } catch (error) {
        console.error('Error deleting invoice:', error);
        setStatus('Could not delete invoice. Please try again.');
        alert(error.message || 'Failed to delete invoice.');
    }
}

// ── DATE PICKER ──
function handleDatePick(/** @type {string} */ isoDate) {
    if (!isoDate) return;
    const [y, m, d] = isoDate.split('-');
    const yy = y.slice(-2);
    const el = document.getElementById('invoice-date');
    if (el) el.value = `${d}-${m}-${yy}`;
}

function openDatePicker() {
    const picker = /** @type {HTMLInputElement} */ (document.getElementById('invoice-date-picker'));
    if (!picker) return;
    try {
        picker.showPicker();
    } catch (_) {
        picker.click();
    }
}

// ── AUTO-GENERATE INVOICE NUMBER ──
async function generateNextInvoiceNumber() {
    const defaultInvoice = `BILL-${new Date().getFullYear()}-001`;
    const invoiceInput = document.getElementById('invoice-no');
    if (!invoiceInput) return;

    await supabaseReady;
    if (!supabaseClient) {
        invoiceInput.value = defaultInvoice;
        updateInvoiceNumber(defaultInvoice);
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('invoices')
            .select('invoice_number')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0 && data[0].invoice_number) {
            const lastInvoice = data[0].invoice_number;
            const parts = lastInvoice.split('-');
            if (parts.length === 3) {
                const prefix = parts[0];
                const year = parts[1];
                const num = parseInt(parts[2], 10);
                if (!isNaN(num)) {
                    const nextNum = (num + 1).toString().padStart(3, '0');
                    const nextInvoice = `${prefix}-${year}-${nextNum}`;
                    invoiceInput.value = nextInvoice;
                    updateInvoiceNumber(nextInvoice);
                    return;
                }
            }
        }
    } catch (e) {
        console.warn('Could not fetch last invoice number, using default:', e);
    }

    invoiceInput.value = defaultInvoice;
    updateInvoiceNumber(defaultInvoice);
}

// ── INIT ──
(function init() {
    const dateEl = /** @type {HTMLInputElement} */ (document.getElementById('invoice-date'));
    const pickerEl = /** @type {HTMLInputElement} */ (document.getElementById('invoice-date-picker'));
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    const yyyy = today.getFullYear();
    if (dateEl) dateEl.value = `${dd}-${mm}-${yy}`;
    if (pickerEl) pickerEl.value = `${yyyy}-${mm}-${dd}`;

    // Start with 3 empty rows
    addRow(); addRow(); addRow();
    
    // Auto-generate next invoice number and load history
    generateNextInvoiceNumber();
    loadInvoiceHistory();
})();
