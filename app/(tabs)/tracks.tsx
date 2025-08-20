import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChartBar as BarChart3, UserCheck, Users, Award, Calendar, Clock, TrendingUp, Search, Filter, X, Plus, Minus } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TracksScreen() {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [addedTracks, setAddedTracks] = useState<string[]>([]);

  // Load added tracks on component mount
  React.useEffect(() => {
    const loadAddedTracks = async () => {
      try {
        const stored = await AsyncStorage.getItem('addedTracks');
        if (stored) {
          setAddedTracks(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading added tracks:', error);
      }
    };
    loadAddedTracks();
  }, []);

  const handleTrackToggle = async (trackId: string) => {
    try {
      let updatedTracks;
      if (addedTracks.includes(trackId)) {
        // Remove track
        updatedTracks = addedTracks.filter(id => id !== trackId);
      } else {
        // Add track
        updatedTracks = [...addedTracks, trackId];
      }
      
      setAddedTracks(updatedTracks);
      await AsyncStorage.setItem('addedTracks', JSON.stringify(updatedTracks));
      
      // Also store track activity data for prioritization
      const trackActivityData = {
        [trackId]: {
          addedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          activityCount: 0,
        }
      };
      
      const existingActivity = await AsyncStorage.getItem('trackActivity');
      const currentActivity = existingActivity ? JSON.parse(existingActivity) : {};
      
      if (updatedTracks.includes(trackId)) {
        // Adding track
        await AsyncStorage.setItem('trackActivity', JSON.stringify({
          ...currentActivity,
          ...trackActivityData
        }));
      } else {
        // Removing track
        delete currentActivity[trackId];
        await AsyncStorage.setItem('trackActivity', JSON.stringify(currentActivity));
      }
    } catch (error) {
      console.error('Error toggling track:', error);
    }
  };

  const tracks = [
    {
      id: 'data-analysis',
      title: 'Communication Mastery',
      description: 'Master verbal and non-verbal communication for professional success',
      icon: BarChart3,
      color: '#3b82f6',
      progress: {
        intent: { completed: true, days: 7, earnedDate: '2024-12-15' },
        practice: { current: 45, total: 90, percentage: 50 },
        performance: { current: 0, total: 365, percentage: 0 },
      },
      stats: {
        totalHours: 28.5,
        sessions: 45,
        streak: 12,
        lastActive: '2025-01-15',
      },
    },
    {
      id: 'sdr-basics',
      title: 'Leadership Fundamentals',
      description: 'Build essential leadership skills for team management and influence',
      icon: UserCheck,
      color: '#10b981',
      progress: {
        intent: { completed: false, current: 5, total: 7, percentage: 71 },
        practice: { current: 0, total: 90, percentage: 0 },
        performance: { current: 0, total: 365, percentage: 0 },
      },
      stats: {
        totalHours: 12.5,
        sessions: 18,
        streak: 5,
        lastActive: '2025-01-14',
      },
    },
    {
      id: 'customer-success',
      title: 'Emotional Intelligence',
      description: 'Develop self-awareness and empathy for better relationships',
      icon: Users,
      color: '#f59e0b',
      progress: {
        intent: { current: 0, total: 7, percentage: 0 },
        practice: { current: 0, total: 90, percentage: 0 },
        performance: { current: 0, total: 365, percentage: 0 },
      },
      stats: {
        totalHours: 0,
        sessions: 0,
        streak: 0,
        lastActive: null,
      },
    },
    {
      id: 'leadership-fundamentals',
      title: 'Time Management Excellence',
      description: 'Optimize productivity and work-life balance strategies',
      icon: Award,
      color: '#8b5cf6',
      progress: {
        intent: { current: 0, total: 7, percentage: 0 },
        practice: { current: 0, total: 90, percentage: 0 },
        performance: { current: 0, total: 365, percentage: 0 },
      },
      stats: {
        totalHours: 0,
        sessions: 0,
        streak: 0,
        lastActive: null,
      },
      tags: ['productivity', 'time-management', 'efficiency'],
      category: 'Productivity',
    },
    {
      id: 'emotional-intelligence',
      title: 'Conflict Resolution',
      description: 'Navigate workplace conflicts with diplomacy and skill',
      icon: Users,
      color: '#ec4899',
      progress: {
        intent: { current: 0, total: 7, percentage: 0 },
        practice: { current: 0, total: 90, percentage: 0 },
        performance: { current: 0, total: 365, percentage: 0 },
      },
      stats: {
        totalHours: 0,
        sessions: 0,
        streak: 0,
        lastActive: null,
      },
      tags: ['conflict-resolution', 'negotiation', 'mediation'],
      category: 'Interpersonal Skills',
    },
    {
      id: 'communication-mastery',
      title: 'Customer Service Excellence',
      description: 'Build exceptional customer relationships and service skills',
      icon: UserCheck,
      color: '#06b6d4',
      progress: {
        intent: { current: 0, total: 7, percentage: 0 },
        practice: { current: 0, total: 90, percentage: 0 },
        performance: { current: 0, total: 365, percentage: 0 },
      },
      stats: {
        totalHours: 0,
        sessions: 0,
        streak: 0,
        lastActive: null,
      },
      tags: ['customer-service', 'relationship-building', 'communication'],
      category: 'Customer Relations',
    },
  ];

  const categories = ['All', 'Communication', 'Leadership', 'Personal Development', 'Productivity', 'Interpersonal Skills', 'Customer Relations'];

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (track.tags && track.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesFilter = !selectedFilter || selectedFilter === 'All' || track.category === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getLevelStatus = (progress: any) => {
    if (progress.intent.completed) {
      if (progress.practice.percentage > 0) {
        if (progress.practice.percentage === 100) {
          return { level: 'Performance', status: 'in-progress', color: '#8b5cf6' };
        }
        return { level: 'Practice', status: 'in-progress', color: '#3b82f6' };
      }
      return { level: 'Intent', status: 'completed', color: '#10b981' };
    } else if (progress.intent.current > 0) {
      return { level: 'Intent', status: 'in-progress', color: '#f59e0b' };
    }
    return { level: 'Not Started', status: 'not-started', color: '#6b7280' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Tracks</Text>
        <Text style={styles.headerSubtitle}>Choose your consistency journey</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tracks, skills, or keywords..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                selectedFilter === category && styles.filterChipSelected
              ]}
              onPress={() => setSelectedFilter(selectedFilter === category ? null : category)}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === category && styles.filterChipTextSelected
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredTracks.length === 0 ? (
          <View style={styles.emptyState}>
            <Search size={48} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No tracks found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        ) : (
          filteredTracks.map((track) => {
          const levelStatus = getLevelStatus(track.progress);
          const IconComponent = track.icon;
          const isExpanded = selectedTrack === track.id;

          return (
            <TouchableOpacity
              key={track.id}
              style={[
                styles.trackCard,
                isExpanded && styles.trackCardExpanded,
              ]}
              onPress={() => setSelectedTrack(isExpanded ? null : track.id)}
            >
              <View style={styles.trackHeader}>
                <View style={[styles.iconContainer, { backgroundColor: track.color }]}>
                  <IconComponent size={24} color="#ffffff" />
                </View>
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={styles.trackDescription}>{track.description}</Text>
                  <View style={styles.statusContainer}>
                    <View 
                      style={[
                        styles.statusBadge, 
                        { backgroundColor: `${levelStatus.color}20`, borderColor: levelStatus.color }
                      ]}
                    >
                      <Text style={[styles.statusText, { color: levelStatus.color }]}>
                        {levelStatus.level}
                      </Text>
                    </View>
                    {track.stats.streak > 0 && (
                      <Text style={styles.streakText}>🔥 {track.stats.streak} days</Text>
                    )}
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.addRemoveButton,
                  { backgroundColor: addedTracks.includes(track.id) ? '#ef4444' : '#10b981' }
                ]}
                onPress={() => handleTrackToggle(track.id)}
              >
                {addedTracks.includes(track.id) ? (
                  <Minus size={16} color="#ffffff" />
                ) : (
                  <Plus size={16} color="#ffffff" />
                )}
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  {/* Progress Levels */}
                  <View style={styles.levelsContainer}>
                    <Text style={styles.sectionTitle}>Credential Progress</Text>
                    
                    {/* Intent Level */}
                    <View style={styles.levelCard}>
                      <View style={styles.levelHeader}>
                        <Award size={16} color="#10b981" />
                        <Text style={styles.levelTitle}>Intent (7 days)</Text>
                        {track.progress.intent.completed && (
                          <View style={styles.completedBadge}>
                            <Text style={styles.completedText}>✓ Earned</Text>
                          </View>
                        )}
                      </View>
                      {track.progress.intent.completed ? (
                        <Text style={styles.levelCompleted}>
                          Earned on {new Date(track.progress.intent.earnedDate).toLocaleDateString()}
                        </Text>
                      ) : (
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBar}>
                            <View 
                              style={[
                                styles.progressFill, 
                                { 
                                  width: `${track.progress.intent.percentage || 0}%`,
                                  backgroundColor: '#10b981'
                                }
                              ]} 
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {track.progress.intent.current || 0}/{track.progress.intent.total} days
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Practice Level */}
                    <View style={[styles.levelCard, !track.progress.intent.completed && styles.levelCardDisabled]}>
                      <View style={styles.levelHeader}>
                        <Award size={16} color="#3b82f6" />
                        <Text style={styles.levelTitle}>Practice (3 months)</Text>
                      </View>
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { 
                                width: `${track.progress.practice.percentage}%`,
                                backgroundColor: '#3b82f6'
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {track.progress.practice.current}/{track.progress.practice.total} days
                        </Text>
                      </View>
                    </View>

                    {/* Performance Level */}
                    <View style={[styles.levelCard, styles.levelCardDisabled]}>
                      <View style={styles.levelHeader}>
                        <Award size={16} color="#8b5cf6" />
                        <Text style={styles.levelTitle}>Performance (12 months)</Text>
                      </View>
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { 
                                width: `${track.progress.performance.percentage}%`,
                                backgroundColor: '#8b5cf6'
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {track.progress.performance.current}/{track.progress.performance.total} days
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Stats */}
                  <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Statistics</Text>
                    <View style={styles.statsGrid}>
                      <View style={styles.statItem}>
                        <Clock size={16} color="#64748b" />
                        <Text style={styles.statValue}>{track.stats.totalHours}h</Text>
                        <Text style={styles.statLabel}>Total Hours</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Calendar size={16} color="#64748b" />
                        <Text style={styles.statValue}>{track.stats.sessions}</Text>
                        <Text style={styles.statLabel}>Sessions</Text>
                      </View>
                      <View style={styles.statItem}>
                        <TrendingUp size={16} color="#64748b" />
                        <Text style={styles.statValue}>{track.stats.streak}</Text>
                        <Text style={styles.statLabel}>Best Streak</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: track.color }]}
                    onPress={() => router.push('/session')}
                  >
                    <Text style={styles.actionButtonText}>
                      {track.stats.sessions === 0 ? 'Start Learning' : 'Continue Learning'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        }))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 17,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '400',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
    fontWeight: '400',
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterContent: {
    paddingRight: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  filterChipTextSelected: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
  trackCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  trackCardExpanded: {
    marginBottom: 24,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  trackDescription: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '400',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  streakText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  levelsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  levelCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  levelCardDisabled: {
    opacity: 0.6,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  levelTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  completedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  levelCompleted: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  progressContainer: {
    gap: 8,
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
  progressText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: 28,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  addRemoveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});