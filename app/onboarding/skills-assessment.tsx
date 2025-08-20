import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Search, X, Target, TrendingUp, Users } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFESSIONAL_SKILLS = [
  // Communication & Interpersonal Skills
  'Active Listening', 'Public Speaking', 'Presentation Skills', 'Written Communication',
  'Verbal Communication', 'Non-verbal Communication', 'Storytelling', 'Persuasion',
  'Networking', 'Relationship Building', 'Conflict Resolution', 'Negotiation',
  
  // Leadership & Management
  'Leadership', 'Team Management', 'Delegation', 'Coaching & Mentoring', 'Performance Management',
  'Strategic Thinking', 'Decision Making', 'Vision Setting', 'Change Management',
  'Influence & Persuasion', 'Motivating Others', 'Feedback Delivery',
  
  // Emotional Intelligence & Self-Management
  'Emotional Intelligence', 'Self-Awareness', 'Self-Regulation', 'Empathy', 'Social Awareness',
  'Stress Management', 'Resilience', 'Adaptability', 'Mindfulness', 'Self-Motivation',
  'Emotional Control', 'Patience',
  
  // Problem-Solving & Critical Thinking
  'Problem Solving', 'Critical Thinking', 'Creative Thinking', 'Innovation', 'Analytical Thinking',
  'Decision Making', 'Strategic Planning', 'Systems Thinking', 'Research Skills',
  'Data Interpretation', 'Logical Reasoning',
  
  // Collaboration & Teamwork
  'Teamwork', 'Collaboration', 'Cross-functional Collaboration', 'Cultural Sensitivity',
  'Diversity & Inclusion', 'Team Building', 'Consensus Building', 'Facilitation',
  'Meeting Management', 'Group Dynamics', 'Peer Relationships',
  
  // Personal Productivity & Organization
  'Time Management', 'Priority Setting', 'Goal Setting', 'Organization', 'Planning',
  'Task Management', 'Efficiency', 'Focus & Concentration', 'Work-Life Balance',
  'Personal Branding', 'Professional Development',
  
  // Customer & Client Relations
  'Customer Service', 'Client Relations', 'Customer Empathy', 'Service Excellence',
  'Customer Communication', 'Complaint Handling', 'Relationship Management',
  'Trust Building', 'Customer Success', 'Account Management',
  
  // Sales & Business Development
  'Sales Communication', 'Relationship Selling', 'Consultative Selling', 'Objection Handling',
  'Closing Techniques', 'Customer Needs Assessment', 'Value Proposition', 'Trust Building',
  'Follow-up Skills', 'Pipeline Management',
  
  // Professional Ethics & Integrity
  'Integrity', 'Ethics', 'Accountability', 'Reliability', 'Honesty', 'Transparency',
  'Professional Conduct', 'Confidentiality', 'Respect', 'Fairness'
];

const ASSESSMENT_STEPS = [
  {
    id: 1,
    title: 'Skills You Excel At',
    subtitle: 'Select the skills where you have strong expertise and confidence',
    icon: TrendingUp,
    color: '#10b981',
  },
  {
    id: 2,
    title: 'Skills Needing Improvement',
    subtitle: 'Choose skills where you have some experience but need development',
    icon: Target,
    color: '#f59e0b',
  },
  {
    id: 3,
    title: 'Skills to Focus On',
    subtitle: 'Pick the skills you want to prioritize for learning and growth',
    icon: Users,
    color: '#3b82f6',
  },
];

export default function SkillsAssessment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<{[key: number]: string[]}>({
    1: [],
    2: [],
    3: [],
  });
  const [filteredSkills, setFilteredSkills] = useState(PROFESSIONAL_SKILLS);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
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

  useEffect(() => {
    // Filter skills based on search query
    if (searchQuery.trim()) {
      const filtered = PROFESSIONAL_SKILLS.filter(skill =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills(PROFESSIONAL_SKILLS);
    }
  }, [searchQuery]);

  const handleSkillToggle = (skill: string) => {
    const currentSkills = selectedSkills[currentStep] || [];
    const isSelected = currentSkills.includes(skill);
    
    if (isSelected) {
      setSelectedSkills({
        ...selectedSkills,
        [currentStep]: currentSkills.filter(s => s !== skill)
      });
    } else {
      if (currentSkills.length < 8) { // Limit to 8 skills per step
        setSelectedSkills({
          ...selectedSkills,
          [currentStep]: [...currentSkills, skill]
        });
      } else {
        Alert.alert('Limit Reached', 'You can select up to 8 skills per category.');
      }
    }
  };

  const handleNext = () => {
    const currentSkills = selectedSkills[currentStep] || [];
    if (currentSkills.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one skill to continue.');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setSearchQuery('');
    } else {
      // Complete skills assessment
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setSearchQuery('');
    } else {
      router.back();
    }
  };

  const completeOnboarding = async () => {
    try {
      // Store complete onboarding data
      const completeUserData = {
        ...userData,
        skillsAssessment: selectedSkills,
        onboardingCompleted: true,
        completedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('userData', JSON.stringify(completeUserData));
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      await AsyncStorage.removeItem('onboardingUserData'); // Clean up temp data

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const currentStepData = ASSESSMENT_STEPS.find(step => step.id === currentStep);
  const currentSkills = selectedSkills[currentStep] || [];
  const IconComponent = currentStepData?.icon || Target;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Skills Assessment</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep + 1) * 25}%` }]} />
          </View>
          <Text style={styles.progressText}>Step {currentStep + 1} of 4</Text>
        </View>

        {/* Step Content */}
        <View style={styles.stepContent}>
          <View style={[styles.stepIconContainer, { backgroundColor: `${currentStepData?.color}20` }]}>
            <IconComponent size={32} color={currentStepData?.color} />
          </View>
          
          <Text style={styles.stepTitle}>{currentStepData?.title}</Text>
          <Text style={styles.stepSubtitle}>{currentStepData?.subtitle}</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search skills..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>

          {/* Selected Skills */}
          {currentSkills.length > 0 && (
            <View style={styles.selectedSkillsContainer}>
              <Text style={styles.selectedSkillsTitle}>
                Selected ({currentSkills.length}/8)
              </Text>
              <View style={styles.selectedSkills}>
                {currentSkills.map((skill, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.selectedSkillChip, { backgroundColor: currentStepData?.color }]}
                    onPress={() => handleSkillToggle(skill)}
                  >
                    <Text style={styles.selectedSkillText}>{skill}</Text>
                    <X size={14} color="#ffffff" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Skills List */}
          <ScrollView style={styles.skillsList} showsVerticalScrollIndicator={false}>
            <View style={styles.skillsGrid}>
              {filteredSkills.map((skill, index) => {
                const isSelected = currentSkills.includes(skill);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.skillChip,
                      isSelected && { 
                        backgroundColor: `${currentStepData?.color}20`,
                        borderColor: currentStepData?.color 
                      }
                    ]}
                    onPress={() => handleSkillToggle(skill)}
                  >
                    <Text style={[
                      styles.skillText,
                      isSelected && { color: currentStepData?.color, fontWeight: '600' }
                    ]}>
                      {skill}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: currentStepData?.color },
            currentSkills.length === 0 && styles.continueButtonDisabled
          ]}
          onPress={handleNext}
          disabled={currentSkills.length === 0}
        >
          <Text style={[
            styles.continueButtonText,
            currentSkills.length === 0 && styles.continueButtonTextDisabled
          ]}>
            {currentStep === 3 ? 'Complete Assessment' : 'Next Step'}
          </Text>
          <ArrowRight 
            size={20} 
            color={currentSkills.length === 0 ? '#9ca3af' : '#ffffff'} 
          />
        </TouchableOpacity>
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
  stepContent: {
    flex: 1,
  },
  stepIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  selectedSkillsContainer: {
    marginBottom: 20,
  },
  selectedSkillsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  selectedSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectedSkillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  skillsList: {
    flex: 1,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 20,
  },
  skillChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  skillText: {
    fontSize: 14,
    color: '#64748b',
  },
  continueButton: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 20,
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