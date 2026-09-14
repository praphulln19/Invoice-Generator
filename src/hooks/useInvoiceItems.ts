import { useState, useCallback, useMemo } from 'react';
import { InvoiceItem, getSqFt, getTotalPrice, getGrandTotal } from '../lib/calculations';

let _nextId = 1;

function makeEmptyRow(): InvoiceItem {
  return { id: _nextId++, size: '', qty: 0, rate: 0, sqft: 0 };
}

export function useInvoiceItems() {
  const [items, setItems] = useState<InvoiceItem[]>(() => [
    makeEmptyRow(),
    makeEmptyRow(),
    makeEmptyRow(),
  ]);

  const addRow = useCallback(() => {
    setItems((prev) => [...prev, makeEmptyRow()]);
  }, []);

  const removeRow = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateField = useCallback(
    (id: number, field: keyof InvoiceItem, value: string | number) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, [field]: value };
          updated.sqft = getSqFt(updated.size);
          return updated;
        }),
      );
    },
    [],
  );

  const clearAll = useCallback(() => {
    _nextId = 1;
    setItems([makeEmptyRow(), makeEmptyRow(), makeEmptyRow()]);
  }, []);

  const grandTotal = useMemo(() => getGrandTotal(items), [items]);

  return { items, addRow, removeRow, updateField, clearAll, grandTotal };
}
