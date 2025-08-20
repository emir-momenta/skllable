import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, ExternalLink, Share2, Copy, Calendar, Clock, Target, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function CredentialsScreen() {
  const [selectedCredential, setSelectedCredential] = useState<string | null>(null);

  const earnedCredentials = [
    {
      id: 'data-analysis-intent',
      trackTitle: 'Data Analysis Fundamentals',
      level: 'Intent',
      levelColor: '#10b981',
      earnedDate: '2024-12-15',
      validUntil: '2025-12-15',
      verificationId: 'DA-INT-2024-789ABC',
      stats: {
        totalDays: 7,
        totalHours: 3.5,
        averageSession: 30,
        longestStreak: 7,
      },
      isActive: true,
      linkedInAdded: true,
    },
    {
      id: 'data-analysis-practice',
      trackTitle: 'Data Analysis Fundamentals',
      level: 'Practice',
      levelColor: '#3b82f6',
      earnedDate: '2025-01-15',
      validUntil: '2026-01-15',
      verificationId: 'DA-PRC-2025-456DEF',
      stats: {
        totalDays: 45,
        totalHours: 22.5,
        averageSession: 30,
        longestStreak: 12,
      },
      isActive: true,
      linkedInAdded: false,
    },
  ];

  const inProgressTracks = [
    {
      trackTitle: 'SDR Basics',
      level: 'Intent',
      levelColor: '#10b981',
      progress: { current: 5, total: 7, percentage: 71 },
      daysLeft: 2,
      currentStreak: 5,
    },
  ];

  const getVerificationUrl = (credentialId: string) => {
    return `https://verify.skllable.com/credential/${credentialId}`;
  };

  const shareCredential = (credential: any) => {
    const url = getVerificationUrl(credential.verificationId);
    Alert.alert(
      'Share Credential',
      `Share your ${credential.level} credential for ${credential.trackTitle}`,
      [
        {
          text: 'Copy Link',
          onPress: () => {
            // In a real app, you'd copy to clipboard
            Alert.alert('Link Copied', 'Verification link copied to clipboard');
          }
        },
        {
          text: 'Add to LinkedIn',
          onPress: () => addToLinkedIn(credential)
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const addToLinkedIn = (credential: any) => {
    // LinkedIn certification URL format
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(`Skllable ${credential.level} - ${credential.trackTitle}`)}&organizationName=Skllable&issueYear=${new Date(credential.earnedDate).getFullYear()}&issueMonth=${new Date(credential.earnedDate).getMonth() + 1}&certUrl=${encodeURIComponent(getVerificationUrl(credential.verificationId))}`;
    
    Alert.alert(
      'Add to LinkedIn',
      'This will open LinkedIn to add your credential to your Licenses & Certifications section.',
      [
        {
          text: 'Continue',
          onPress: () => {
            // In a real app, you'd open the URL
            Alert.alert('LinkedIn Integration', 'Would open LinkedIn with pre-filled certification details');
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const viewVerificationPage = (credential: any) => {
    Alert.alert(
      'Public Verification',
      `View the public verification page for this credential.\n\nVerification ID: ${credential.verificationId}`,
      [
        {
          text: 'Open Verification Page',
          onPress: () => {
            // In a real app, you'd open the verification URL
            Alert.alert('Verification Page', 'Would open public verification page in browser');
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Credentials</Text>
        <Text style={styles.headerSubtitle}>Verifiable learning consistency achievements</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Earned Credentials */}
        {earnedCredentials.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earned Credentials</Text>
            {earnedCredentials.map((credential) => {
              const isExpanded = selectedCredential === credential.id;
              
              return (
                <TouchableOpacity
                  key={credential.id}
                  style={[
                    styles.credentialCard,
                    isExpanded && styles.credentialCardExpanded,
                    { borderLeftColor: credential.levelColor }
                  ]}
                  onPress={() => setSelectedCredential(isExpanded ? null : credential.id)}
                >
                  <View style={styles.credentialHeader}>
                    <View style={[styles.credentialBadge, { backgroundColor: credential.levelColor }]}>
                      <Award size={20} color="#ffffff" />
                    </View>
                    <View style={styles.credentialInfo}>
                      <Text style={styles.credentialTitle}>{credential.trackTitle}</Text>
                      <Text style={[styles.credentialLevel, { color: credential.levelColor }]}>
                        {credential.level} Credential
                      </Text>
                      <Text style={styles.credentialDate}>
                        Earned {new Date(credential.earnedDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.credentialStatus}>
                      {credential.isActive && (
                        <View style={styles.activeBadge}>
                          <CheckCircle size={16} color="#10b981" />
                        </View>
                      )}
                      {credential.linkedInAdded && (
                        <Text style={styles.linkedInBadge}>LinkedIn ✓</Text>
                      )}
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.credentialDetails}>
                      <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                          <Calendar size={16} color="#64748b" />
                          <Text style={styles.statValue}>{credential.stats.totalDays}</Text>
                          <Text style={styles.statLabel}>Days Active</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Clock size={16} color="#64748b" />
                          <Text style={styles.statValue}>{credential.stats.totalHours}h</Text>
                          <Text style={styles.statLabel}>Total Hours</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Target size={16} color="#64748b" />
                          <Text style={styles.statValue}>{credential.stats.longestStreak}</Text>
                          <Text style={styles.statLabel}>Best Streak</Text>
                        </View>
                      </View>

                      <View style={styles.verificationInfo}>
                        <Text style={styles.verificationTitle}>Verification Details</Text>
                        <Text style={styles.verificationId}>ID: {credential.verificationId}</Text>
                        <Text style={styles.verificationValid}>
                          Valid until: {new Date(credential.validUntil).toLocaleDateString()}
                        </Text>
                      </View>

                      <View style={styles.credentialActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => viewVerificationPage(credential)}
                        >
                          <ExternalLink size={16} color="#3b82f6" />
                          <Text style={styles.actionButtonText}>View Public Page</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[styles.actionButton, styles.shareButton]}
                          onPress={() => shareCredential(credential)}
                        >
                          <Share2 size={16} color="#ffffff" />
                          <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>Share</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* In Progress */}
        {inProgressTracks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In Progress</Text>
            {inProgressTracks.map((track, index) => (
              <View key={index} style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <View style={[styles.progressBadge, { backgroundColor: track.levelColor }]}>
                    <Target size={16} color="#ffffff" />
                  </View>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressTitle}>{track.trackTitle}</Text>
                    <Text style={[styles.progressLevel, { color: track.levelColor }]}>
                      {track.level} Level
                    </Text>
                    <Text style={styles.progressStreak}>
                      🔥 {track.currentStreak} day streak
                    </Text>
                  </View>
                </View>
                
                <View style={styles.progressDetails}>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${track.progress.percentage}%`,
                            backgroundColor: track.levelColor
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {track.progress.current}/{track.progress.total} days • {track.daysLeft} days left
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Available Tracks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Credentials</Text>
          <Text style={styles.sectionSubtitle}>
            Build 7-day learning habit, then advance to 3-month and 12-month credentials
          </Text>
          
          {['Communication Mastery', 'Leadership Fundamentals', 'Emotional Intelligence'].map((track, index) => (
            <TouchableOpacity key={index} style={styles.availableTrack}>
              <View style={styles.availableTrackInfo}>
                <Text style={styles.availableTrackTitle}>{track}</Text>
                <Text style={styles.availableTrackDescription}>
                  Develop essential soft skills through consistent daily practice
                </Text>
              </View>
              <View style={styles.levelIndicators}>
                <View style={[styles.levelDot, { backgroundColor: '#10b981' }]} />
                <View style={[styles.levelDot, { backgroundColor: '#3b82f6' }]} />
                <View style={[styles.levelDot, { backgroundColor: '#8b5cf6' }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>About Skllable</Text>
          <Text style={styles.helpText}>
            Skllable helps professionals develop essential soft skills through consistent daily practice. 
            Our credentials verify your learning commitment and consistency, making them valuable 
            additions to your professional profile and LinkedIn.
          </Text>
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  credentialCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  credentialCardExpanded: {
    marginBottom: 24,
  },
  credentialHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  credentialBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  credentialInfo: {
    flex: 1,
  },
  credentialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  credentialLevel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  credentialDate: {
    fontSize: 12,
    color: '#64748b',
  },
  credentialStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  activeBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedInBadge: {
    fontSize: 10,
    color: '#0077b5',
    fontWeight: '500',
  },
  credentialDetails: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  verificationInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  verificationId: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  verificationValid: {
    fontSize: 12,
    color: '#64748b',
  },
  credentialActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    backgroundColor: '#ffffff',
  },
  shareButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  progressLevel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  progressStreak: {
    fontSize: 12,
    color: '#64748b',
  },
  progressDetails: {
    marginTop: 8,
  },
  progressBarContainer: {
    gap: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
  },
  availableTrack: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  availableTrackInfo: {
    flex: 1,
  },
  availableTrackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  availableTrackDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  levelIndicators: {
    flexDirection: 'row',
    gap: 4,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  helpSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});