import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Button, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import FetchWithErrorLogging from '../utils/FetchWithErrorLogging';

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async (url, description) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      console.log(`🔄 Fetching data: ${description}`);
      const result = await FetchWithErrorLogging.get(url);
      setData({ url, description, result });
      console.log('✅ Data fetched successfully:', result);
    } catch (err) {
      setError({ url, description, error: err.message });
      console.error('❌ Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const testErrorScenarios = async (scenario) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      console.log(`🧪 Testing error scenario: ${scenario}`);
      const result = await FetchWithErrorLogging.testErrorScenario(scenario);
      setData({ 
        url: `Test: ${scenario}`, 
        description: `Error scenario: ${scenario}`, 
        result 
      });
    } catch (err) {
      setError({ 
        url: `Test: ${scenario}`, 
        description: `Error scenario: ${scenario}`, 
        error: err.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🚀 Welcome Buddy!</Text>
      
      {/* Success Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Success Examples</Text>
        <Button 
          title="Fetch JSONPlaceholder Posts" 
          onPress={() => fetchData('https://jsonplaceholder.typicode.com/posts/1', 'JSONPlaceholder Post')}
        />
        <Button 
          title="Fetch Random User" 
          onPress={() => fetchData('https://randomuser.me/api/', 'Random User Data')}
        />
        <Button 
          title="Fetch HTTP Status" 
          onPress={() => fetchData('https://httpstat.us/200', 'HTTP Status Check')}
        />
      </View>

      {/* Error Testing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Error Testing</Text>
        <Button 
          title="Test Server Error (500)" 
          onPress={() => testErrorScenarios('network')}
        />
        <Button 
          title="Test Not Found (404)" 
          onPress={() => testErrorScenarios('notFound')}
        />
        <Button 
          title="Test Network Error" 
          onPress={() => testErrorScenarios('invalid')}
        />
        <Button 
          title="Test Timeout" 
          onPress={() => testErrorScenarios('timeout')}
        />
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Success Result */}
      {data && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>✅ Success Result:</Text>
          <Text style={styles.resultText}>URL: {data.url}</Text>
          <Text style={styles.resultText}>Description: {data.description}</Text>
          <Text style={styles.resultText}>
            Data: {JSON.stringify(data.result, null, 2).substring(0, 200)}...
          </Text>
        </View>
      )}

      {/* Error Result */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Error Result:</Text>
          <Text style={styles.errorText}>URL: {error.url}</Text>
          <Text style={styles.errorText}>Description: {error.description}</Text>
          <Text style={styles.errorText}>Error: {error.error}</Text>
        </View>
      )}

      <Button title="Refresh App" onPress={() => console.log('App refreshed!')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '600', 
    marginBottom: 20,
    textAlign: 'center',
    color: '#16a34a',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  resultContainer: {
    backgroundColor: '#d1fae5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 4,
  },
});

