import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Building2, Mail, ArrowRight, ArrowLeft, Shield } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BusinessAuth() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSSO = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Mock SSO authentication
    setTimeout(async () => {
      if (email.toLowerCase() === 'schen@techcorp.com') {
        // Store user data for the onboarding flow
        const userData = {
          name: 'Sarah Chen',
          email: 'schen@techcorp.com',
          department: 'Sales Development',
          company: 'TechCorp',
          accountType: 'business',
          isPremium: true,
        };
        
        // Store user data for the onboarding flow
        try {
          await AsyncStorage.setItem('onboardingUserData', JSON.stringify(userData));
        } catch (error) {
          console.error('Error storing user data:', error);
        }
        
        setIsLoading(false);
        router.push('/onboarding/skills-assessment');
      } else {
        setIsLoading(false);
        Alert.alert(
          'Authentication Failed',
          'Unable to authenticate with your organization. Please contact your IT administrator.',
          [{ text: 'OK' }]
        );
      }
    }, 2000); // Simulate network delay
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Business Login</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 4</Text>
        </View>

        {/* Content */}
        <View style={styles.authContent}>
          <View style={styles.iconContainer}>
            <Building2 size={48} color="#3b82f6" />
          </View>

          <Text style={styles.title}>Sign in with SSO</Text>
          <Text style={styles.subtitle}>
            Enter your corporate email address to authenticate with your organization's Single Sign-On system.
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                placeholder="Enter your corporate email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.ssoButton, isLoading && styles.ssoButtonLoading]}
              onPress={handleSSO}
              disabled={isLoading}
            >
              <Shield size={20} color="#ffffff" />
              <Text style={styles.ssoButtonText}>
                {isLoading ? 'Authenticating...' : 'Sign in with SSO'}
              </Text>
              {!isLoading && <ArrowRight size={20} color="#ffffff" />}
            </TouchableOpacity>
          </View>

          {/* Demo Instructions */}
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Demo Instructions</Text>
            <Text style={styles.demoText}>
              For demonstration purposes, use the email:{'\n'}
              <Text style={styles.demoEmail}>schen@techcorp.com</Text>
            </Text>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Shield size={16} color="#64748b" />
            <Text style={styles.securityText}>
              Your login is secured by your organization's authentication system
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  authContent: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  ssoButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  ssoButtonLoading: {
    opacity: 0.7,
  },
  ssoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  demoContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    width: '100%',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  demoEmail: {
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
  },
  securityText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});