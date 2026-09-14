import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, DimensionValue } from 'react-native';
import { COLORS } from '../lib/constants';

function usePulse(): Animated.Value {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return pulse;
}

function SkeletonBar({
  width,
  height = 11,
}: {
  width: DimensionValue;
  height?: number;
}) {
  const opacity = usePulse();
  return <Animated.View style={[styles.bar, { width, height, opacity }]} />;
}

export function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.rowLeft}>
            <SkeletonBar width="62%" height={13} />
            <View style={styles.gapSm} />
            <SkeletonBar width="46%" />
            <View style={styles.gapXs} />
            <SkeletonBar width="38%" />
          </View>
          <View style={styles.rowActions}>
            <SkeletonBar width={78} height={26} />
            <SkeletonBar width={30} height={26} />
          </View>
        </View>
      ))}
    </>
  );
}

export default function InvoiceHistorySkeleton() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Invoice History</Text>
        <View style={styles.refreshBtn}>
          <Text style={styles.refreshBtnText}>↻ Refresh</Text>
        </View>
      </View>
      <SkeletonRows count={3} />
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
    opacity: 0.5,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.woodDark,
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
  rowActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  bar: {
    backgroundColor: COLORS.woodBorder,
    borderRadius: 4,
  },
  gapSm: {
    height: 6,
  },
  gapXs: {
    height: 4,
  },
});
