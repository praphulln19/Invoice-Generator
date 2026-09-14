import React from 'react';
import { View, Text, Image, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { COLORS, COMPANY } from '../lib/constants';

export default function InvoiceHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.inner}>
        {/* Brand */}
        <View style={styles.brand}>
          <Image
            source={require('../../assets/design.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>{COMPANY.name}</Text>
        </View>

        {/* Meta */}
        <View style={styles.meta}>
          <Text style={styles.metaText}>{COMPANY.address}</Text>
          <Text style={styles.metaText}>{COMPANY.area}</Text>
          <Text style={styles.metaText}>{COMPANY.city}</Text>
          <Text style={styles.metaText}>📞 {COMPANY.phone1}</Text>
          <Text style={styles.metaText}>📞 {COMPANY.phone2}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(COMPANY.website)}>
            <Text style={[styles.metaText, styles.link]}>🌐 supraon.vercel.app</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Invoice Tag */}
      <View style={styles.tagBar}>
        <Text style={styles.tagText}>BILL INVOICE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.woodMid,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  brandName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
    flexShrink: 1,
  },
  meta: {
    alignItems: 'flex-end',
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    lineHeight: 18,
  },
  link: {
    textDecorationLine: 'underline',
    color: '#FFD9A0',
  },
  tagBar: {
    backgroundColor: COLORS.woodLight,
    paddingVertical: 7,
    alignItems: 'center',
  },
  tagText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 3,
  },
});
