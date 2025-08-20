import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, User, Briefcase, Building2, ChevronDown } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFESSIONAL_ROLES = [
  // Leadership & Management
  'CEO/Executive', 'Director', 'Manager', 'Team Lead', 'Project Manager',
  
  // Sales & Business Development
  'Sales Manager', 'Sales Representative', 'Business Development', 'Account Manager',
  'Sales Development Representative (SDR)', 'Customer Success Manager',
  
  // Marketing & Communications
  'Marketing Manager', 'Content Creator', 'Communications Specialist', 'Brand Manager',
  'Social Media Manager', 'Public Relations',
  
  // Human Resources & People
  'HR Manager', 'Recruiter', 'Training Specialist', 'People Operations',
  'Organizational Development', 'Employee Relations',
  
  // Consulting & Advisory
  'Consultant', 'Business Analyst', 'Strategy Advisor', 'Coach/Mentor',
  'Trainer/Facilitator', 'Change Management',
  
  // Operations & Administration
  'Operations Manager', 'Administrative Assistant', 'Office Manager',
  'Program Coordinator', 'Executive Assistant',
  
  // Customer-Facing Roles
  'Customer Service Representative', 'Support Specialist', 'Client Relations',
  'Account Coordinator', 'Customer Experience',
  
  // Entrepreneurship & Freelance
  'Entrepreneur', 'Freelancer', 'Consultant', 'Small Business Owner',
  'Startup Founder', 'Independent Professional',
  
  // Other Professional Roles
  'Non-Profit Professional', 'Healthcare Administrator', 'Education Professional',
  'Government Employee', 'Other'
];

export default function ProfessionalInfo() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('onboardingUserData');
        if (storedData) {
          setUserData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setShowDropdown(false);
    if (role !== 'Other') {
      setCustomRole('');
    }
  };

  const handleContinue = async () => {
    const finalRole = selectedRole === 'Other' ? customRole : selectedRole;
    
    if (!finalRole?.trim()) return;

    try {
      const updatedUserData = {
        ...userData,
        professionalTitle: finalRole,
        professionalInfoCompleted: true,
      };

      await AsyncStorage.setItem('onboardingUserData', JSON.stringify(updatedUserData));
      router.push('/onboarding/plan-selection');
    } catch (error) {
      console.error('Error saving professional info:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isValidSelection = selectedRole && (selectedRole !== 'Other' || customRole.trim());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Professional Info</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '40%' }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 4</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Briefcase size={48} color="#3b82f6" />
            </View>
            <Text style={styles.heroTitle}>What's Your Professional Role?</Text>
            <Text style={styles.heroSubtitle}>
              Help us personalize your soft skills development journey based on your current position and career goals.
            </Text>
          </View>

          {/* Role Dropdown */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowDropdown(true)}
            >
              <User size={20} color="#64748b" />
              <Text style={[
                styles.dropdownButtonText,
                !selectedRole && styles.dropdownPlaceholder
              ]}>
                {selectedRole || 'Select your professional role...'}
              </Text>
              <ChevronDown size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Dropdown Modal */}
          <Modal
            visible={showDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowDropdown(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowDropdown(false)}
            >
              <View style={styles.dropdownModal}>
                <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
                  {PROFESSIONAL_ROLES.map((role, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        selectedRole === role && styles.dropdownItemSelected
                      ]}
                      onPress={() => handleRoleSelect(role)}
                    >
                      <Building2 size={16} color={selectedRole === role ? "#3b82f6" : "#64748b"} />
                      <Text style={[
                        styles.dropdownItemText,
                        selectedRole === role && styles.dropdownItemTextSelected
                      ]}>
                        {role}
                      </Text>
                      {selectedRole === role && (
                        <View style={styles.selectedIndicator}>
                          <View style={styles.selectedDot} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Custom Role Input */}
          {selectedRole === 'Other' && (
            <View style={styles.customRoleContainer}>
              <Text style={styles.customRoleLabel}>Please specify your role:</Text>
              <TextInput
                style={styles.customRoleInput}
                placeholder="Enter your professional title"
                value={customRole}
                onChangeText={setCustomRole}
                placeholderTextColor="#9ca3af"
                autoFocus
              />
            </View>
          )}

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Why This Matters</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitEmoji}>🎯</Text>
                </View>
                <Text style={styles.benefitText}>
                  Personalized learning paths tailored to your role
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitEmoji}>📈</Text>
                </View>
                <Text style={styles.benefitText}>
                  Skills recommendations based on career progression
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitEmoji}>🤝</Text>
                </View>
                <Text style={styles.benefitText}>
                  Connect with peers in similar roles for insights
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isValidSelection && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!isValidSelection}
          >
            <Text style={[
              styles.continueButtonText,
              !isValidSelection && styles.continueButtonTextDisabled
            ]}>
              Continue
            </Text>
            <ArrowRight 
              size={20} 
              color={!isValidSelection ? '#9ca3af' : '#ffffff'} 
            />
          </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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
    marginBottom: 30,
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
  scrollContent: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 32,
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
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dropdownContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 20,
    maxHeight: '70%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  customRoleContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  customRoleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  customRoleInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitEmoji: {
    fontSize: 16,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  continueButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  continueButtonTextDisabled: {
    color: '#9ca3af',
  },
});