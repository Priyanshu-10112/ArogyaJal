import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Modal,
  ScrollView,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'bn', label: 'বাংলা (Bangla)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
];

export default function LaunchScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_OPTIONS[0]);
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);

  const handleLanguageSelect = () => {
    setIsLangModalVisible(true);
  };

  const handleGetStarted = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Boarding');
    } else {
      console.log('Get Started pressed');
    }
  };

  const selectLanguage = (lang) => {
    setSelectedLanguage(lang);
    setIsLangModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6fbff" />

      {/* Background accents */}
      <View style={styles.bgAccentLarge} />
      <View style={styles.bgAccentSmall} />

      <View style={styles.contentWrap}>
        {/* Header / Branding */}
        <View style={styles.header}>
          <Text style={styles.appName}>ArogyaJal</Text>
          <Text style={styles.tagline}>Water & Health</Text>
        </View>

        {/* Hero Illustration: App Logo */}
        <View style={styles.hero}>
          <Image
            source={require('../assets/images/waterHealthLogo.png')}
            resizeMode="contain"
            style={styles.heroLogo}
            accessibilityRole="image"
            accessible
            accessibilityLabel="ArogyaJal water and health logo"
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryCta} onPress={handleGetStarted}>
            <Text style={styles.primaryCtaText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryCta} onPress={handleLanguageSelect}>
            <Text style={styles.secondaryCtaText}>{selectedLanguage.label}</Text>
            <Text style={styles.chevron}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Select Modal */}
      <Modal
        visible={isLangModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLangModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Choose Language</Text>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {LANGUAGE_OPTIONS.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langOption,
                    selectedLanguage.code === lang.code && styles.langOptionActive,
                  ]}
                  onPress={() => selectLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      selectedLanguage.code === lang.code && styles.langOptionTextActive,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setIsLangModalVisible(false)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const HERO_LOGO_SIZE = Math.min(width * 0.8, 150);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbff',
  },
  contentWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bgAccentLarge: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: '#e8f3ff',
    top: -width * 0.7,
    right: -width * 0.4,
  },
  bgAccentSmall: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#ecfdf5',
    bottom: -width * 0.45,
    left: -width * 0.2,
  },
  header: {
    alignItems: 'center',
    marginTop: 12,
  },
  logoMark: {
    width: 64,
    height: 64,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkImage: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  dropOuter: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: '#22c55e',
    opacity: 0.7,
    transform: [{ rotate: '45deg' }],
  },
  dropInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22c55e',
    transform: [{ rotate: '45deg' }],
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0b8f39',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#16a34a',
    marginTop: 4,
  },
  hero: {
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogo: {
    width: HERO_LOGO_SIZE,
    height: HERO_LOGO_SIZE,
  },
  // Actions
  actions: {
    marginTop: 24,
    width: '100%',
    maxWidth: 420,
  },
  primaryCta: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  primaryCtaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryCta: {
    marginTop: 14,
    backgroundColor: '#e8f3ff',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryCtaText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  chevron: {
    color: '#1f2937',
    fontSize: 12,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalList: {
    maxHeight: 320,
    marginVertical: 6,
  },
  langOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    marginVertical: 6,
  },
  langOptionActive: {
    backgroundColor: '#dcfce7',
  },
  langOptionText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    textAlign: 'center',
  },
  langOptionTextActive: {
    color: '#065f46',
  },
  modalClose: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  modalCloseText: {
    color: '#111827',
    fontWeight: '600',
  },
});


