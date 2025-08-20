import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Award, Calendar, Clock, Target, CircleCheck as CheckCircle, ExternalLink } from 'lucide-react-native';

interface PublicVerificationProps {
  credentialData: {
    id: string;
    trackTitle: string;
    level: 'Intent' | 'Practice' | 'Performance';
    learnerName: string;
    earnedDate: string;
    validUntil: string;
    isActive: boolean;
    stats: {
      totalDays: number;
      totalHours: number;
      longestStreak: number;
      averageSession: number;
    };
    timeline: Array<{
      week: string;
      active: boolean;
    }>;
  };
}

export default function PublicVerification({ credentialData }: PublicVerificationProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Intent': return '#10b981';
      case 'Practice': return '#3b82f6';
      case 'Performance': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const getLevelRequirements = (level: string) => {
    switch (level) {
      case 'Intent': return '7 consecutive days';
      case 'Practice': return '3 months (90 days)';
      case 'Performance': return '12 months (365 days)';
      default: return '';
    }
  };

  const levelColor = getLevelColor(credentialData.level);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Skllable</Text>
          <Text style={styles.logoSubtext}>Consistency Credentials</Text>
        </View>
        <View style={styles.verificationBadge}>
          <CheckCircle size={16} color="#10b981" />
          <Text style={styles.verificationText}>Verified</Text>
        </View>
      </View>

      {/* Credential Details */}
      <View style={styles.credentialCard}>
        <View style={[styles.credentialBadge, { backgroundColor: levelColor }]}>
          <Award size={32} color="#ffffff" />
        </View>
        
        <Text style={styles.credentialTitle}>{credentialData.trackTitle}</Text>
        <Text style={[styles.credentialLevel, { color: levelColor }]}>
          {credentialData.level} Credential
        </Text>
        <Text style={styles.credentialRequirement}>
          {getLevelRequirements(credentialData.level)} of consistent learning
        </Text>
        
        <View style={styles.credentialMeta}>
          <Text style={styles.learnerName}>Earned by {credentialData.learnerName}</Text>
          <Text style={styles.earnedDate}>
            Issued: {new Date(credentialData.earnedDate).toLocaleDateString()}
          </Text>
          <Text style={[
            styles.validityStatus,
            { color: credentialData.isActive ? '#10b981' : '#ef4444' }
          ]}>
            {credentialData.isActive ? 
              `Valid until ${new Date(credentialData.validUntil).toLocaleDateString()}` :
              'Expired'
            }
          </Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Learning Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Calendar size={20} color="#64748b" />
            <Text style={styles.statNumber}>{credentialData.stats.totalDays}</Text>
            <Text style={styles.statLabel}>Active Days</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={20} color="#64748b" />
            <Text style={styles.statNumber}>{credentialData.stats.totalHours}h</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={20} color="#64748b" />
            <Text style={styles.statNumber}>{credentialData.stats.longestStreak}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={20} color="#64748b" />
            <Text style={styles.statNumber}>{credentialData.stats.averageSession}m</Text>
            <Text style={styles.statLabel}>Avg Session</Text>
          </View>
        </View>
      </View>

      {/* Activity Timeline */}
      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>Consistency Timeline</Text>
        <Text style={styles.timelineDescription}>
          Weekly activity pattern showing consistent learning behavior
        </Text>
        
        <View style={styles.timeline}>
          {credentialData.timeline.map((week, index) => (
            <View
              key={index}
              style={[
                styles.timelineWeek,
                { backgroundColor: week.active ? levelColor : '#e2e8f0' }
              ]}
              title={`Week ${index + 1}: ${week.active ? 'Active' : 'Inactive'}`}
            />
          ))}
        </View>
        
        <View style={styles.timelineLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: levelColor }]} />
            <Text style={styles.legendText}>Active Week</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#e2e8f0' }]} />
            <Text style={styles.legendText}>Inactive Week</Text>
          </View>
        </View>
      </View>

      {/* Credential Info */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>About This Credential</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Skllable Consistency Credentials verify learning habits, not mastery. 
            This {credentialData.level.toLowerCase()} level credential confirms that 
            the learner maintained consistent daily practice for {getLevelRequirements(credentialData.level).toLowerCase()}.
          </Text>
          
          <View style={styles.verificationDetails}>
            <Text style={styles.verificationId}>
              Credential ID: {credentialData.id}
            </Text>
            <Text style={styles.issuer}>
              Issued by: Skllable Platform
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Verify this credential at skllable.com
        </Text>
        <ExternalLink size={14} color="#64748b" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  logoSubtext: {
    fontSize: 12,
    color: '#64748b',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803d',
  },
  credentialCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
  },
  credentialBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  credentialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  credentialLevel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  credentialRequirement: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  credentialMeta: {
    alignItems: 'center',
    gap: 4,
  },
  learnerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  earnedDate: {
    fontSize: 14,
    color: '#64748b',
  },
  validityStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 20,
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
  timelineSection: {
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  timelineDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  timeline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 16,
  },
  timelineWeek: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  timelineLegend: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  verificationDetails: {
    gap: 4,
  },
  verificationId: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  issuer: {
    fontSize: 12,
    color: '#64748b',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
});