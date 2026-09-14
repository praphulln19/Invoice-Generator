import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { PASSCODE_HASH, PASSCODE_SALT } from '../lib/constants';

const SESSION_KEY = 'suproan_unlocked';

/**
 * SHA-256 of (pin + PASSCODE_SALT).
 * - Native: uses expo-crypto (guaranteed on Hermes/Android)
 * - Web: uses crypto.subtle SHA-256
 * Both produce identical hex digests.
 */
async function sha256Hash(pin: string): Promise<string> {
  const input = pin + PASSCODE_SALT;

  if (Platform.OS !== 'web') {
    // expo-crypto works on all native platforms
    return Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      input,
      { encoding: Crypto.CryptoEncoding.HEX },
    );
  }

  // Web: use SubtleCrypto SHA-256
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function isSessionActive(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    }
    const val = await SecureStore.getItemAsync(SESSION_KEY);
    return val === '1';
  } catch {
    return false;
  }
}

async function setSessionActive(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      sessionStorage.setItem(SESSION_KEY, '1');
      return;
    }
    await SecureStore.setItemAsync(SESSION_KEY, '1');
  } catch {
    // ignore
  }
}

export function usePasscode() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkSession = useCallback(async () => {
    const active = await isSessionActive();
    setUnlocked(active);
    setChecking(false);
  }, []);

  const verify = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const hash = await sha256Hash(pin);
      if (hash === PASSCODE_HASH) {
        await setSessionActive();
        setUnlocked(true);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Passcode verify error:', e);
      return false;
    }
  }, []);

  return { unlocked, checking, checkSession, verify };
}
