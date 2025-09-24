import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';

const { width } = Dimensions.get('window');

export default function BoardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6fbff" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}> 
          <Text style={styles.title}>ArogyaJal</Text>
          <Text style={styles.subtitle}>Water & Health</Text>
        </View>

        <View style={styles.centerWrap}>
        <View style={styles.illustrationsRow}>
          <TouchableOpacity
            style={styles.illustrationCard}
            accessibilityRole="button"
            accessibilityLabel="Select ASHA Workers"
            activeOpacity={0.8}
            onPress={() => navigation && navigation.navigate ? navigation.navigate('AshaLogin') : null}
          >
            <View style={[styles.illustrationBubble, styles.ashaBg]}>
              <Text style={styles.illustrationEmoji}>🏛️</Text>
            </View>
            <Text style={styles.illustrationLabel}>ASHA Workers</Text>
            <Text style={styles.illustrationDesc}>Field health workers supporting communities.</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.illustrationCard}
            accessibilityRole="button"
            accessibilityLabel="Select Local Residents"
            activeOpacity={0.8}
            onPress={() => navigation && navigation.navigate ? navigation.navigate('Home') : null}
          >
            <View style={[styles.illustrationBubble, styles.localBg]}>
              <Text style={styles.illustrationEmoji}>🧑‍🤝‍🧑</Text>
            </View>
            <Text style={styles.illustrationLabel}>Local Residents</Text>
            <Text style={styles.illustrationDesc}>Community members using the services.</Text>
          </TouchableOpacity>
        </View>
        </View>
      
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_MAX_WIDTH = Math.min(width - 32, 420);
const ILLUSTRATION_CARD_WIDTH = Math.floor((CARD_MAX_WIDTH - 24) / 2);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbff',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0b8f39',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#16a34a',
    textAlign: 'center',
  },
  centerWrap: {
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  illustrationsRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    alignSelf: 'center',
    marginTop: 20,
    justifyContent: 'center',
  },
  illustrationCard: {
    width: ILLUSTRATION_CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  illustrationBubble: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ashaBg: {
    backgroundColor: '#e6f7ff',
    borderWidth: 2,
    borderColor: '#93c5fd',
  },
  localBg: {
    backgroundColor: '#ecfdf5',
    borderWidth: 2,
    borderColor: '#86efac',
  },
  illustrationEmoji: {
    fontSize: 54,
  },
  illustrationLabel: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#065f46',
  },
  illustrationDesc: {
    marginTop: 4,
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  // removed separate actions; illustration cards act as buttons now
  illustration: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: Math.min(width * 0.8, 320),
    height: Math.min(width * 0.8, 320),
  },
  points: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
  },
  pointCard: {
    width: CARD_MAX_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#22c55e',
  },
  pointTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 6,
  },
  pointText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    width: CARD_MAX_WIDTH,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});


