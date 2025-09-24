import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Colors } from '../constants/Colors';

export default function AshaDashboardScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandPill}>
          <Text style={styles.brandTitle}>ArogyaJal</Text>
          <Text style={styles.brandSub}>Water & Health</Text>
        </View>
        <View style={styles.topIcons}>
          <Text style={styles.topIcon}>🔔</Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation && navigation.navigate && navigation.navigate('Boarding')}
          >
            <Text style={styles.topIcon}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation && navigation.navigate && navigation.navigate('AshaLogin')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome */}
        <View style={styles.welcomeRow}>
          <Text style={styles.welcomeHand}>🙏</Text>
          <Text style={styles.welcomeText}>Welcome, <Text style={styles.welcomeName}>Riya Devi</Text></Text>
        </View>

        {/* Search */}
        <TextInput placeholder="Search" placeholderTextColor="#6b7280" style={styles.search} />

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ marginRight: 6 }}>🧭</Text>
            <Text style={styles.summaryTitle}>Today's Summary</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.statText}>🧑‍🤝‍🧑 Patients: <Text style={styles.statBold}>5</Text></Text>
            <Text style={styles.statText}>⚠️ Unsafe: <Text style={styles.statWarn}>1</Text></Text>
            <Text style={styles.statText}>⏳ Pending: <Text style={styles.statBold}>2</Text></Text>
          </View>
        </View>

        {/* Pending Reports */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Pending Reports</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.listItem} onPress={() => navigation && navigation.navigate && navigation.navigate('AshaReportCase')}>
          <Text style={styles.listIcon}>🧾</Text>
          <Text style={styles.listLabel}>Report a case</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} onPress={() => navigation && navigation.navigate && navigation.navigate('Alerts')}>
          <Text style={styles.listIcon}>🔔</Text>
          <Text style={styles.listLabel}>Alerts</Text>
        </TouchableOpacity>

        {/* Educational Tips */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Educational Tips</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.tipCard}><Text style={styles.tipIcon}>🫧</Text><Text style={styles.tipLabel}>Hygiene</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tipCard}><Text style={styles.tipIcon}>📷</Text><Text style={styles.tipLabel}>Upload</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tipCard}><Text style={styles.tipIcon}>💧</Text><Text style={styles.tipLabel}>Water</Text></TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickCard}>
          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickTile}><Text style={styles.quickIcon}>📄</Text><Text style={styles.quickText}>Generate Report</Text></TouchableOpacity>
            <TouchableOpacity style={styles.quickTile} onPress={() => navigation && navigation.navigate && navigation.navigate('SensorUpload')}><Text style={styles.quickIcon}>⚗️</Text><Text style={styles.quickText}>Upload Sensor Data</Text></TouchableOpacity>
          </View>
          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickTile}onPress={() => navigation && navigation.navigate && navigation.navigate('Alerts')}><Text style={styles.quickIcon}>🚨</Text><Text style={styles.quickText}>Alerts</Text></TouchableOpacity>
            <TouchableOpacity style={styles.quickTile}><Text style={styles.quickIcon}>👥</Text><Text style={styles.quickText}>Community</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomBar}>
        <View style={styles.tabItem}><Text style={styles.tabIcon}>🏠</Text><Text style={styles.tabText}>Home</Text></View>
        <View style={styles.tabItem}><Text style={styles.tabIcon}>👤</Text><Text style={styles.tabText}>Profile</Text></View>
        <View style={styles.tabItem}><Text style={styles.tabIcon}>⚙️</Text><Text style={styles.tabText}>Settings</Text></View>
        <View style={styles.tabItem}><Text style={styles.tabIcon}>❓</Text><Text style={styles.tabText}>Help</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6fbff' },
  topBar: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandPill: {
    backgroundColor: '#e0f2e9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  brandTitle: { fontSize: 12, fontWeight: '800', color: '#065f46' },
  brandSub: { fontSize: 10, color: '#065f46' },
  topIcons: { flexDirection: 'row', alignItems: 'center' },
  topIcon: { color: 'white', fontSize: 16, marginHorizontal: 8 },
  profileIcon: { color: 'white', fontSize: 18, marginLeft: 8 },

  scrollContent: { padding: 16, paddingBottom: 100 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  welcomeHand: { fontSize: 16, marginRight: 6 },
  welcomeText: { fontSize: 16, color: '#111827' },
  welcomeName: { fontWeight: '700', color: '#065f46' },

  search: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  summaryCard: {
    backgroundColor: '#e7f7ec',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 16,
  },
  summaryTitle: { fontWeight: '800', color: '#0f172a' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statText: { color: '#0f172a' },
  statBold: { fontWeight: '700' },
  statWarn: { fontWeight: '700', color: '#b91c1c' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginVertical: 8 },
  viewAll: { color: Colors.primaryDark, fontWeight: '700' },

  listItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: { marginRight: 10 },
  listLabel: { flex: 1, color: '#111827' },
  smallBtn: { backgroundColor: Colors.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  smallBtnText: { color: 'white', fontWeight: '700', fontSize: 12 },

  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tipCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  tipIcon: { fontSize: 18, marginBottom: 4 },
  tipLabel: { color: '#111827' },

  quickCard: { backgroundColor: '#e7f7ec', borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0', padding: 12 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  quickTile: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, alignItems: 'center', marginRight: 10 },
  quickIcon: { fontSize: 20, marginBottom: 6 },
  quickText: { textAlign: 'center', color: '#0f172a' },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabItem: { alignItems: 'center' },
  tabIcon: { color: 'white' },
  tabText: { color: 'white', fontSize: 10, marginTop: 2 },
});


