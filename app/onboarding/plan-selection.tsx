import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Check, Star, Zap, Crown, Shield } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PlanSelection() {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);

    try {
      // Get existing user data
      const existingData = await AsyncStorage.getItem('onboardingUserData');
      const userData = existingData ? JSON.parse(existingData) : {};

      // Add plan selection to user data
      const updatedUserData = {
        ...userData,
        selectedPlan,
        planSelectedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('onboardingUserData', JSON.stringify(updatedUserData));
      
      // Navigate to skills assessment
      router.push('/onboarding/skills-assessment');
    } catch (error) {
      console.error('Error saving plan selection:', error);
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 4</Text>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Unlock Your Growth Potential</Text>
            <Text style={styles.heroSubtitle}>
              Choose the plan that fits your personal development journey. 
              Start free and upgrade anytime as your needs grow.
            </Text>
          </View>

          {/* Plan Cards */}
          <View style={styles.plansContainer}>
            {/* Free Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                styles.freePlanCard,
                selectedPlan === 'free' && styles.planCardSelected
              ]}
              onPress={() => setSelectedPlan('free')}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <View style={styles.planIconContainer}>
                  <Shield size={28} color="#10b981" />
                </View>
                <View style={styles.planTitleContainer}>
                  <Text style={styles.planTitle}>Free Plan</Text>
                  <Text style={styles.planSubtitle}>Perfect to get started</Text>
                </View>
                {selectedPlan === 'free' && (
                  <View style={styles.selectedIndicator}>
                    <Check size={20} color="#ffffff" />
                  </View>
                )}
              </View>

              <View style={styles.planPricing}>
                <Text style={styles.planPrice}>$0</Text>
                <Text style={styles.planPeriod}>forever</Text>
              </View>

              <View style={styles.planFeatures}>
                <View style={styles.featureItem}>
                  <Check size={16} color="#10b981" />
                  <Text style={styles.featureText}>3 learning tracks</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#10b981" />
                  <Text style={styles.featureText}>Basic progress tracking</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#10b981" />
                  <Text style={styles.featureText}>Weekly insights</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#10b981" />
                  <Text style={styles.featureText}>Community access</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#10b981" />
                  <Text style={styles.featureText}>Mobile app</Text>
                </View>
              </View>

              <Text style={styles.planNote}>
                Great for exploring soft skills development and building initial habits.
              </Text>
            </TouchableOpacity>

            {/* Premium Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                styles.premiumPlanCard,
                selectedPlan === 'premium' && styles.planCardSelected
              ]}
              onPress={() => setSelectedPlan('premium')}
              activeOpacity={0.8}
            >
              <View style={styles.popularBadge}>
                <Star size={12} color="#ffffff" />
                <Text style={styles.popularText}>Most Popular</Text>
              </View>

              <View style={styles.planHeader}>
                <View style={[styles.planIconContainer, { backgroundColor: '#3b82f620' }]}>
                  <Crown size={28} color="#3b82f6" />
                </View>
                <View style={styles.planTitleContainer}>
                  <Text style={[styles.planTitle, { color: '#3b82f6' }]}>Premium Plan</Text>
                  <Text style={styles.planSubtitle}>Accelerate your growth</Text>
                </View>
                {selectedPlan === 'premium' && (
                  <View style={[styles.selectedIndicator, { backgroundColor: '#3b82f6' }]}>
                    <Check size={20} color="#ffffff" />
                  </View>
                )}
              </View>

              <View style={styles.planPricing}>
                <Text style={[styles.planPrice, { color: '#3b82f6' }]}>$19</Text>
                <Text style={styles.planPeriod}>per month</Text>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>Save 20% yearly</Text>
                </View>
              </View>

              <View style={styles.planFeatures}>
                <View style={styles.featureItem}>
                  <Check size={16} color="#3b82f6" />
                  <Text style={styles.featureText}>All learning tracks (15+)</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#3b82f6" />
                  <Text style={styles.featureText}>Advanced analytics & insights</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#3b82f6" />
                  <Text style={styles.featureText}>Personalized learning paths</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#3b82f6" />
                  <Text style={styles.featureText}>1-on-1 coaching sessions</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#3b82f6" />
                  <Text style={styles.featureText}>Priority support</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#3b82f6" />
                  <Text style={styles.featureText}>Offline content access</Text>
                </View>
                <View style={styles.featureItem}>
                  <Check size={16} color="#3b82f6" />
                  <Text style={styles.featureText}>Certificate of completion</Text>
                </View>
              </View>

              <Text style={styles.planNote}>
                Perfect for serious learners who want to maximize their personal development ROI.
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trust Badge */}
          <View style={styles.trustSection}>
            <Shield size={16} color="#10b981" />
            <Text style={styles.trustText}>30-day money-back guarantee</Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: selectedPlan ? '#10b981' : '#e2e8f0' },
              !selectedPlan && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!selectedPlan || isLoading}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.continueButtonText,
              !selectedPlan && styles.continueButtonTextDisabled
            ]}>
              {isLoading ? 'Processing...' : 'Continue'}
            </Text>
            {!isLoading && (
              <ArrowRight size={20} color={selectedPlan ? '#ffffff' : '#9ca3af'} />
            )}
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            Select the plan that matches your soft skills development goals.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  plansContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 20,
  },
  planCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  freePlanCard: {
    borderColor: '#10b981',
  },
  premiumPlanCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#fafbff',
  },
  planCardSelected: {
    transform: [{ scale: 1.01 }],
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planTitleContainer: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginRight: 8,
  },
  planPeriod: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  savingsBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803d',
  },
  planFeatures: {
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 16,
  },
  planNote: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  trustSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803d',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  continueButton: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: '#e2e8f0',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  continueButtonTextDisabled: {
    color: '#9ca3af',
  },
  footerNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});