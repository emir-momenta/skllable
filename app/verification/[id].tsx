import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PublicVerification from '@/components/PublicVerification';
import { generateVerificationPageData } from '@/utils/credentialVerification';
import { CircleAlert as AlertCircle } from 'lucide-react-native';

export default function VerificationPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // In a real app, you would fetch this data from an API
  const credentialData = generateVerificationPageData(id, []);
  
  if (!credentialData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <AlertCircle size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Credential Not Found</Text>
          <Text style={styles.errorText}>
            The credential with ID "{id}" could not be verified.
            Please check the ID and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return <PublicVerification credentialData={credentialData} />;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});