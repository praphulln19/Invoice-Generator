import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

let _client: SupabaseClient | null = null;
let _initPromise: Promise<SupabaseClient | null> | null = null;

async function resolveCredentials(): Promise<{ url: string; key: string } | null> {
  // 1. EXPO_PUBLIC_ env vars (work locally and when EAS Secrets are set)
  const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (envUrl && envKey && !envUrl.includes('YOUR_PROJECT_REF')) {
    return { url: envUrl, key: envKey };
  }

  // 2. app.json extra (baked into APK at build time — works on native without EAS Secrets)
  const extra = Constants.expoConfig?.extra as
    | { supabaseUrl?: string; supabaseAnonKey?: string }
    | undefined;
  const extraUrl = extra?.supabaseUrl ?? '';
  const extraKey = extra?.supabaseAnonKey ?? '';
  if (extraUrl && extraKey) {
    return { url: extraUrl, key: extraKey };
  }

  // 3. Web: fetch from Vercel /api/config (same as the old HTML app)
  if (Platform.OS === 'web') {
    try {
      const res = await fetch('/api/config');
      const cfg = await res.json();
      if (cfg?.url && cfg?.key) return { url: cfg.url, key: cfg.key };
    } catch {
      // offline or local dev
    }
  }

  return null;
}

export function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (_client) return Promise.resolve(_client);
  if (_initPromise) return _initPromise;

  _initPromise = resolveCredentials().then((creds) => {
    if (!creds) {
      console.warn('Supabase: no credentials found — save to cloud disabled.');
      return null;
    }
    _client = createClient(creds.url, creds.key);
    return _client;
  });

  return _initPromise;
}
