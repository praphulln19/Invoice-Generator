import React, { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, View, StyleSheet, Platform } from 'react-native';
import PasscodeGate from '../src/components/PasscodeGate';
import InvoiceScreen from './invoice/index';
import { COLORS } from '../src/lib/constants';

export default function HomeScreen() {
  const [unlocked, setUnlocked] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Lock whenever app goes to background or is closed
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const wasActive = appState.current === 'active';
      const goingBackground =
        nextState === 'background' || nextState === 'inactive';

      if (wasActive && goingBackground) {
        setUnlocked(false); // immediately lock
      }
      appState.current = nextState;
    });

    // Web: lock on tab hide / window close
    if (Platform.OS === 'web') {
      const handleVisibility = () => {
        if (document.visibilityState === 'hidden') {
          setUnlocked(false);
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);
      return () => {
        sub.remove();
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    }

    return () => sub.remove();
  }, []);

  if (!unlocked) {
    return <PasscodeGate onUnlocked={() => setUnlocked(true)} />;
  }

  return (
    <View style={styles.container}>
      <InvoiceScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.woodBg,
  },
});
