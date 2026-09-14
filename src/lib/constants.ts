// ── SIZES ──────────────────────────────────────────────────────────────────
export const SIZES = [
  '84*42', '84*40', '84*38', '84*36', '84*34', '84*32',
  '81*42', '81*40', '81*38', '81*36', '81*34', '81*32',
  '78*38', '78*36', '78*34', '78*32', '78*30',
];

// ── COMPANY INFO ────────────────────────────────────────────────────────────
export const COMPANY = {
  name: 'Supraon Enterprises',
  address: 'C/O - Supraon Enterprises',
  area: 'Donar Industrial Area',
  city: 'Darbhanga – 864009',
  phone1: '8294150110',
  phone2: '7992315783',
  website: 'https://supraon.vercel.app/',
};

// ── PASSCODE (SHA-256) ───────────────────────────────────────────────────────
// SHA-256 of (pin + PASSCODE_SALT). PIN is never stored directly.
export const PASSCODE_HASH = '432ff9663525e03d0c56151e5d9cda8901d5a65a202f6a690dd1b7cdec248322';
export const PASSCODE_SALT = 'SuproanEnterprises2026Secure';
// PBKDF2_ITERATIONS kept for backwards-compat imports (unused now)
export const PBKDF2_ITERATIONS = 1;

// ── BRAND COLORS ─────────────────────────────────────────────────────────────
export const COLORS = {
  woodDark: '#3E1F0D',
  woodMid: '#6B3A1F',
  woodLight: '#9B5A30',
  woodBg: '#FDF6EE',
  woodBorder: '#D4A87A',
  ink: '#1A1008',
  mutedText: '#6B5B4E',
  white: '#FFFFFF',
  errorRed: '#C62828',
  successGreen: '#2E7D32',
  tableHeader: '#5C2E0A',
  tableRowAlt: '#FDF0E6',
  tableRowBase: '#FFFBF7',
};
