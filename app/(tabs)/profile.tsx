import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Mail, Calendar, Settings, Award, ChartBar as BarChart3, Target, Bell, ExternalLink, Crown, Star, Zap, Shield, Gem } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Sara Chen',
    email: 'schen@techcorp.com',
    joinDate: '2024-10-15',
    timezone: 'America/New_York',
    department: 'Sales Development',
    manager: 'Mike Johnson',
    employeeId: 'TC-2024-1847',
  });

  const [tempProfile, setTempProfile] = useState(profile);
  
  const overallStats = {
    totalCredentials: 2,
    totalHours: 26,
    longestStreak: 28,
    totalSessions: 63,
    tracksStarted: 2,
    activeStreaks: 1,
    totalBadges: 8,
    currentTier: 'Gold',
  };

  // Badge System - 6 tiers with progression
  const badgeSystem = {
    tiers: [
      { name: 'Bronze', color: '#cd7f32', icon: Award, minPoints: 0 },
      { name: 'Silver', color: '#c0c0c0', icon: Star, minPoints: 100 },
      { name: 'Gold', color: '#ffd700', icon: Crown, minPoints: 300 },
      { name: 'Platinum', color: '#e5e4e2', icon: Zap, minPoints: 600 },
      { name: 'Diamond', color: '#b9f2ff', icon: Gem, minPoints: 1000 },
      { name: 'Challenger', color: '#ff6b6b', icon: Shield, minPoints: 1500 },
    ],
    currentPoints: 450,
  };

  const badges = [
    {
      id: 'first-session',
      title: 'First Steps',
      description: 'Completed your first learning session',
      tier: 'Bronze',
      points: 10,
      earned: true,
      earnedDate: '2024-10-16',
      rarity: 'Common',
      category: 'Getting Started'
    },
    {
      id: 'week-warrior',
      title: 'Week Warrior',
      description: 'Maintained a 7-day learning streak',
      tier: 'Silver',
      points: 25,
      earned: true,
      earnedDate: '2024-10-23',
      rarity: 'Common',
      category: 'Consistency'
    },
    {
      id: 'intent-master',
      title: 'Intent Master',
      description: 'Earned your first Intent credential',
      tier: 'Gold',
      points: 50,
      earned: true,
      earnedDate: '2024-12-15',
      rarity: 'Uncommon',
      category: 'Credentials'
    },
    {
      id: 'multi-track',
      title: 'Multi-Track Master',
      description: 'Active in 2+ tracks simultaneously',
      tier: 'Gold',
      points: 75,
      earned: true,
      earnedDate: '2024-11-05',
      rarity: 'Uncommon',
      category: 'Exploration'
    },
    {
      id: 'practice-pioneer',
      title: 'Practice Pioneer',
      description: 'Earned your first Practice credential',
      tier: 'Platinum',
      points: 100,
      earned: false,
      rarity: 'Rare',
      category: 'Credentials'
    },
    {
      id: 'marathon-learner',
      title: 'Marathon Learner',
      description: 'Completed 100+ learning sessions',
      tier: 'Platinum',
      points: 150,
      earned: false,
      rarity: 'Rare',
      category: 'Dedication'
    },
    {
      id: 'perfect-month',
      title: 'Perfect Month',
      description: 'Maintained 30-day streak with 90%+ quiz scores',
      tier: 'Diamond',
      points: 200,
      earned: false,
      rarity: 'Epic',
      category: 'Excellence'
    },
    {
      id: 'knowledge-champion',
      title: 'Knowledge Champion',
      description: 'Achieved 95%+ average quiz score across all tracks',
      tier: 'Challenger',
      points: 300,
      earned: false,
      rarity: 'Legendary',
      category: 'Mastery'
    },
  ];

  const getCurrentTier = () => {
    const currentPoints = badgeSystem.currentPoints;
    for (let i = badgeSystem.tiers.length - 1; i >= 0; i--) {
      if (currentPoints >= badgeSystem.tiers[i].minPoints) {
        return badgeSystem.tiers[i];
      }
    }
    return badgeSystem.tiers[0];
  };

  const getNextTier = () => {
    const currentTier = getCurrentTier();
    const currentIndex = badgeSystem.tiers.findIndex(tier => tier.name === currentTier.name);
    return currentIndex < badgeSystem.tiers.length - 1 ? badgeSystem.tiers[currentIndex + 1] : null;
  };

  const getTierColor = (tierName: string) => {
    const tier = badgeSystem.tiers.find(t => t.name === tierName);
    return tier ? tier.color : '#64748b';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#64748b';
      case 'Uncommon': return '#10b981';
      case 'Rare': return '#3b82f6';
      case 'Epic': return '#8b5cf6';
      case 'Legendary': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const saveProfile = () => {
    setProfile(tempProfile);
    setIsEditing(false);
    Alert.alert('Profile Updated', 'Your profile has been saved successfully.');
  };

  const cancelEdit = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const manageNotifications = () => {
    Alert.alert(
      'Notification Settings',
      'Configure your learning reminders and badge notifications.',
      [
        { text: 'Daily Reminders: ON', onPress: () => {} },
        { text: 'Badge Notifications: ON', onPress: () => {} },
        { text: 'Weekly Summary: ON', onPress: () => {} },
        { text: 'Done', style: 'cancel' },
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Download your learning data and badge achievements.',
      [
        { text: 'Download CSV', onPress: () => Alert.alert('Export', 'CSV export would start') },
        { text: 'Download PDF Summary', onPress: () => Alert.alert('Export', 'PDF summary would start') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const contactIT = () => {
    Alert.alert(
      'Contact IT Support',
      'For account changes or technical support, please contact your IT administrator.',
      [
        { text: 'Email IT Support', onPress: () => Alert.alert('Email', 'Would open email to it-support@techcorp.com') },
        { text: 'Submit Ticket', onPress: () => Alert.alert('Ticket', 'Would open IT support portal') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to complete onboarding again.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.removeItem('userData');
              await AsyncStorage.removeItem('onboardingCompleted');
              await AsyncStorage.removeItem('onboardingUserData');
              
              // Clear any other app-specific data
              const allKeys = await AsyncStorage.getAllKeys();
              const keysToRemove = allKeys.filter(key => 
                key.startsWith('streak_') || key.startsWith('lastSession_')
              );
              await AsyncStorage.multiRemove(keysToRemove);
              
              // Navigate back to onboarding
              router.replace('/onboarding/');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const earnedBadges = badges.filter(badge => badge.earned);
  const availableBadges = badges.filter(badge => !badge.earned);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={32} color="#ffffff" />
          </View>
          <View style={styles.profileInfo}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={tempProfile.name}
                onChangeText={(text) => setTempProfile({...tempProfile, name: text})}
                placeholder="Your name"
              />
            ) : (
              <Text style={styles.profileName}>{profile.name}</Text>
            )}
            
            <View style={styles.profileMeta}>
              <Mail size={14} color="#64748b" />
              <Text style={styles.profileEmail}>{profile.email}</Text>
            </View>
            
            <View style={styles.profileMeta}>
              <Text style={styles.profileDepartment}>{profile.department}</Text>
            </View>
            
            <View style={styles.profileMeta}>
              <Calendar size={14} color="#64748b" />
              <Text style={styles.profileJoinDate}>
                Member since {new Date(profile.joinDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => isEditing ? saveProfile() : setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Badge Tier Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badge Progression</Text>
          <View style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <View style={[styles.tierBadge, { backgroundColor: currentTier.color }]}>
                <currentTier.icon size={24} color="#ffffff" />
              </View>
              <View style={styles.tierInfo}>
                <Text style={[styles.tierName, { color: currentTier.color }]}>
                  {currentTier.name} Tier
                </Text>
                <Text style={styles.tierPoints}>
                  {badgeSystem.currentPoints} points
                </Text>
              </View>
            </View>
            
            {nextTier && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    Progress to {nextTier.name}
                  </Text>
                  <Text style={styles.progressText}>
                    {badgeSystem.currentPoints}/{nextTier.minPoints}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${(badgeSystem.currentPoints / nextTier.minPoints) * 100}%`,
                        backgroundColor: nextTier.color
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.pointsNeeded}>
                  {nextTier.minPoints - badgeSystem.currentPoints} points needed
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Overall Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Award size={20} color="#10b981" />
              <Text style={styles.statNumber}>{overallStats.totalBadges}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
            <View style={styles.statCard}>
              <BarChart3 size={20} color="#3b82f6" />
              <Text style={styles.statNumber}>{overallStats.totalHours}h</Text>
              <Text style={styles.statLabel}>Total Hours</Text>
            </View>
            <View style={styles.statCard}>
              <Target size={20} color="#f59e0b" />
              <Text style={styles.statNumber}>{overallStats.longestStreak}</Text>
              <Text style={styles.statLabel}>Longest Streak</Text>
            </View>
          </View>
          
          <View style={styles.additionalStats}>
            <View style={styles.additionalStat}>
              <Text style={styles.additionalStatNumber}>{overallStats.totalSessions}</Text>
              <Text style={styles.additionalStatLabel}>Total Sessions</Text>
            </View>
            <View style={styles.additionalStat}>
              <Text style={styles.additionalStatNumber}>{overallStats.totalCredentials}</Text>
              <Text style={styles.additionalStatLabel}>Credentials</Text>
            </View>
            <View style={styles.additionalStat}>
              <Text style={styles.additionalStatNumber}>{badgeSystem.currentPoints}</Text>
              <Text style={styles.additionalStatLabel}>Badge Points</Text>
            </View>
          </View>
        </View>

        {/* Earned Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earned Badges ({earnedBadges.length})</Text>
          <View style={styles.badgesGrid}>
            {earnedBadges.map((badge) => {
              const tierColor = getTierColor(badge.tier);
              const rarityColor = getRarityColor(badge.rarity);
              
              return (
                <View key={badge.id} style={[styles.badgeCard, { borderColor: tierColor }]}>
                  <View style={[styles.badgeBadge, { backgroundColor: tierColor }]}>
                    <Award size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                  <View style={styles.badgeMeta}>
                    <Text style={[styles.badgeTier, { color: tierColor }]}>
                      {badge.tier}
                    </Text>
                    <Text style={[styles.badgeRarity, { color: rarityColor }]}>
                      {badge.rarity}
                    </Text>
                  </View>
                  <Text style={styles.badgePoints}>+{badge.points} pts</Text>
                  <Text style={styles.badgeEarned}>
                    Earned {new Date(badge.earnedDate).toLocaleDateString()}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Available Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Badges ({availableBadges.length})</Text>
          <View style={styles.badgesGrid}>
            {availableBadges.map((badge) => {
              const tierColor = getTierColor(badge.tier);
              const rarityColor = getRarityColor(badge.rarity);
              
              return (
                <View key={badge.id} style={[styles.badgeCard, styles.badgeCardLocked, { borderColor: '#e2e8f0' }]}>
                  <View style={[styles.badgeBadge, { backgroundColor: '#9ca3af' }]}>
                    <Award size={20} color="#ffffff" />
                  </View>
                  <Text style={[styles.badgeTitle, { color: '#9ca3af' }]}>
                    {badge.title}
                  </Text>
                  <Text style={[styles.badgeDescription, { color: '#9ca3af' }]}>
                    {badge.description}
                  </Text>
                  <View style={styles.badgeMeta}>
                    <Text style={[styles.badgeTier, { color: '#9ca3af' }]}>
                      {badge.tier}
                    </Text>
                    <Text style={[styles.badgeRarity, { color: '#9ca3af' }]}>
                      {badge.rarity}
                    </Text>
                  </View>
                  <Text style={[styles.badgePoints, { color: '#9ca3af' }]}>
                    +{badge.points} pts
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Corporate Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.corporateCard}>
            <Text style={styles.corporateTitle}>Corporate Account</Text>
            <View style={styles.corporateInfo}>
              <Text style={styles.corporateLabel}>Employee ID: {profile.employeeId}</Text>
              <Text style={styles.corporateLabel}>Department: {profile.department}</Text>
              <Text style={styles.corporateLabel}>Manager: {profile.manager}</Text>
            </View>
            <Text style={styles.corporateNote}>
              This account is managed by your organization's IT department. 
              For account changes or technical support, please contact IT.
            </Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings & Support</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={manageNotifications}>
            <Bell size={20} color="#64748b" />
            <Text style={styles.settingText}>Notification Preferences</Text>
            <ExternalLink size={16} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={exportData}>
            <BarChart3 size={20} color="#64748b" />
            <Text style={styles.settingText}>Export Learning Data</Text>
            <ExternalLink size={16} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Settings size={20} color="#64748b" />
            <Text style={styles.settingText}>Privacy Settings</Text>
            <ExternalLink size={16} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={contactIT}>
            <User size={20} color="#64748b" />
            <Text style={styles.settingText}>Contact IT Support</Text>
            <ExternalLink size={16} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  profileHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#3b82f6',
    paddingBottom: 2,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  profileDepartment: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  profileJoinDate: {
    fontSize: 12,
    color: '#64748b',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
  },
  editActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  tierCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  tierBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tierPoints: {
    fontSize: 16,
    color: '#64748b',
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pointsNeeded: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  additionalStats: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  additionalStat: {
    flex: 1,
    alignItems: 'center',
  },
  additionalStatNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  additionalStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeCardLocked: {
    backgroundColor: '#f8fafc',
  },
  badgeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  badgeMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  badgeTier: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  badgeRarity: {
    fontSize: 10,
    fontWeight: '500',
  },
  badgePoints: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 4,
  },
  badgeEarned: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  corporateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  corporateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  corporateInfo: {
    gap: 4,
    marginBottom: 12,
  },
  corporateLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  corporateNote: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  settingItem: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  logoutItem: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    textAlign: 'center',
  },
});