import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../lib/constants';
import { usePasscode } from '../hooks/usePasscode';

interface Props {
  onUnlocked: () => void;
}

const NUMPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export default function PasscodeGate({ onUnlocked }: Props) {
  const { unlocked, checking, checkSession, verify } = usePasscode();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (unlocked && !checking) {
      onUnlocked();
    }
  }, [unlocked, checking, onUnlocked]);

  useEffect(() => {
    if (pin.length === 4 && !busy) {
      handleVerify(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  async function handleVerify(currentPin: string) {
    setBusy(true);
    setStatus('Verifying…');
    setError('');
    const ok = await verify(currentPin);
    if (ok) {
      setStatus('');
      onUnlocked();
    } else {
      shake();
      setError('Incorrect passcode. Try again.');
      setStatus('');
      setPin('');
      setBusy(false);
    }
  }

  function shake() {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function appendDigit(d: string) {
    if (busy || pin.length >= 4) return;
    setError('');
    setPin((p) => p + d);
  }

  function deleteDigit() {
    if (busy) return;
    setError('');
    setPin((p) => p.slice(0, -1));
  }

  if (checking) {
    return (
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/design.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.heading}>Enter Passcode</Text>
        <Text style={styles.subText}>This tool is for authorised use only.</Text>

        {/* PIN dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={i < pin.length ? [styles.dot, styles.dotFilled] : styles.dot}
            />
          ))}
        </View>

        {/* Status / Error */}
        {status ? (
          <Text style={styles.statusText}>{status}</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={{ height: 20 }} />
        )}

        {/* Numpad */}
        <View style={styles.numpad}>
          {NUMPAD.map((key, idx) => {
            if (key === '') return <View key={idx} style={styles.numBtnBlank} />;
            if (key === '⌫') {
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.numBtn, styles.numBtnDel]}
                  onPress={deleteDigit}
                  activeOpacity={0.7}
                >
                  <Text style={styles.numBtnText}>⌫</Text>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={idx}
                style={styles.numBtn}
                onPress={() => appendDigit(key)}
                activeOpacity={0.7}
              >
                <Text style={styles.numBtnText}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.woodDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    width: '88%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.woodBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  logo: {
    width: 64,
    height: 64,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.woodDark,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subText: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginBottom: 24,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.woodMid,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: COLORS.woodMid,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.mutedText,
    height: 20,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.errorRed,
    height: 20,
    marginBottom: 8,
    fontWeight: '600',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    gap: 12,
    marginTop: 8,
    justifyContent: 'center',
  },
  numBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.woodBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
  },
  numBtnBlank: {
    width: 64,
    height: 64,
  },
  numBtnDel: {
    backgroundColor: '#FDE8D8',
    borderColor: COLORS.woodLight,
  },
  numBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.woodDark,
  },
});
