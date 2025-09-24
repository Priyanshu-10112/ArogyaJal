import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Dimensions, Alert } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_MAX_WIDTH = Math.min(width - 32, 420);

export default function AshaLoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const onLogin = () => {
    navigation && navigation.navigate && navigation.navigate('AshaDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6fbff" />

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        activeOpacity={0.8}
        style={styles.backButton}
        onPress={() => navigation && navigation.navigate && navigation.navigate('Boarding')}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.banner}>
        <View style={styles.artCenter} accessibilityRole="image" accessibilityLabel="Healthcare login illustration">
          <View style={[styles.emblem, styles.emblemMain]}>
            <Text style={styles.emblemEmoji}>🏥</Text>
          </View>
          <View style={[styles.badge, styles.badgeLeft]}>
            <Text style={styles.badgeEmoji}>🩺</Text>
          </View>
          <View style={[styles.badge, styles.badgeRight]}>
            <Text style={styles.badgeEmoji}>📋</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>ASHA Login</Text>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🏛️</Text>
          </View>
        </View>

        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter Phone Number"
          keyboardType="phone-pad"
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />

        <TextInput
          value={otp}
          onChangeText={setOtp}
          placeholder="Enter OTP"
          keyboardType="number-pad"
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6fbff' },
  backButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backIcon: { fontSize: 18, color: '#111827' },
  banner: {
    height: 140,
    backgroundColor: '#e6f7ff',
    overflow: 'hidden',
  },
  artCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emblem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  emblemMain: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#e0f2fe',
    borderColor: '#93c5fd',
  },
  emblemEmoji: { fontSize: 50 },
  badge: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeLeft: { left: CARD_MAX_WIDTH * 0.15, top: 24 },
  badgeRight: { right: CARD_MAX_WIDTH * 0.15, top: 24 },
  badgeEmoji: { fontSize: 22 },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    marginTop: 8,
    marginBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#93c5fd',
  },
  avatarEmoji: { fontSize: 18 },
  input: {
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
    marginTop: 12,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    elevation: 2,
  },
  loginButtonText: { color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
});


