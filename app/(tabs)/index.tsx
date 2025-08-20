import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, ChevronRight, Play } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

// Generate mock activity data for the contribution graph (6 months)
const generateActivityData = () => {
  const weeks = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - 6); // 6 months ago
  
  // Generate 26 weeks of data (6 months)
  for (let week = 0; week < 26; week++) {
    const weekData = [];
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (week * 7) + day);
      
      // Generate random activity level (0-4)
      let activity = 0;
      if (currentDate <= today) {
        // Higher probability of activity in recent weeks
        const daysSinceStart = Math.floor((today - currentDate) / (1000 * 60 * 60 * 24));
        const recentBonus = daysSinceStart < 30 ? 0.3 : 0;
        activity = Math.random() + recentBonus > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
      }
      
      weekData.push({
        date: currentDate,
        activity: activity
      });
    }
    weeks.push(weekData);
  }
  
  return weeks;
};

// Get color for activity level
const getDayColor = (activity) => {
  const colors = [
    '#ebedf0', // No activity
    '#c6e48b', // Low activity
    '#7bc96f', // Medium-low activity
    '#239a3b', // Medium-high activity
    '#196127'  // High activity
  ];
  return colors[activity] || colors[0];
};

export default function HomeScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [greeting, setGreeting] = useState('Good morning!');
  const [ongoingLearning, setOngoingLearning] = useState<any[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const user = JSON.parse(storedData);
          setUserData(user);
          
          // Generate personalized greeting
          const firstName = user.name ? user.name.split(' ')[0] : '';
          if (firstName) {
            setGreeting(`Good morning, ${firstName}!`);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  // Load and prioritize ongoing learning tracks
  useEffect(() => {
    const loadOngoingLearning = async () => {
      try {
        const addedTracksData = await AsyncStorage.getItem('addedTracks');
        const trackActivityData = await AsyncStorage.getItem('trackActivity');
        
        if (addedTracksData) {
          const addedTracks = JSON.parse(addedTracksData);
          const trackActivity = trackActivityData ? JSON.parse(trackActivityData) : {};
          
          // All available tracks data
          const allTracks = [
            {
              id: 'data-analysis',
              title: 'Communication Mastery',
              subtitle: 'Intent Level Progress',
              progress: 5,
              total: 7,
              daysLeft: 2,
              color: '#10b981',
            },
            {
              id: 'sdr-basics',
              title: 'Leadership Fundamentals',
              subtitle: 'Intent Level Progress',
              progress: 45,
              total: 90,
              daysLeft: 45,
              color: '#3b82f6',
            },
            {
              id: 'customer-success',
              title: 'Emotional Intelligence',
              subtitle: 'Intent Level Progress',
              progress: 0,
              total: 7,
              daysLeft: 7,
              color: '#f59e0b',
            },
            {
              id: 'leadership-fundamentals',
              title: 'Time Management Excellence',
              subtitle: 'Intent Level Progress',
              progress: 0,
              total: 7,
              daysLeft: 7,
              color: '#8b5cf6',
            },
            {
              id: 'emotional-intelligence',
              title: 'Conflict Resolution',
              subtitle: 'Intent Level Progress',
              progress: 0,
              total: 7,
              daysLeft: 7,
              color: '#ec4899',
            },
            {
              id: 'communication-mastery',
              title: 'Customer Service Excellence',
              subtitle: 'Intent Level Progress',
              progress: 0,
              total: 7,
              daysLeft: 7,
              color: '#06b6d4',
            },
          ];
          
          // Filter to only added tracks
          const addedTrackData = allTracks.filter(track => addedTracks.includes(track.id));
          
          // Sort by priority: 1) Most progress, 2) Most recently added
          const prioritizedTracks = addedTrackData.sort((a, b) => {
            const aActivity = trackActivity[a.id];
            const bActivity = trackActivity[b.id];
            
            // First priority: tracks with progress
            if (a.progress > 0 && b.progress === 0) return -1;
            if (b.progress > 0 && a.progress === 0) return 1;
            
            // If both have progress, sort by progress amount
            if (a.progress > 0 && b.progress > 0) {
              return b.progress - a.progress;
            }
            
            // If neither has progress, sort by most recently added
            if (aActivity && bActivity) {
              return new Date(bActivity.addedAt).getTime() - new Date(aActivity.addedAt).getTime();
            }
            
            return 0;
          });
          
          // Take only the top 2 tracks
          setOngoingLearning(prioritizedTracks.slice(0, 2));
        } else {
          setOngoingLearning([]);
        }
      } catch (error) {
        console.error('Error loading ongoing learning:', error);
      }
    };
    
    loadOngoingLearning();
    
    // Set up interval to refresh data periodically
    const interval = setInterval(loadOngoingLearning, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const streakData = {
    current: 12,
  };

  const handlePlayQuiz = (trackId: string) => {
    router.push('/session');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {userData?.accountType === 'business' && userData?.company && (
              <Text style={styles.companyName}>{userData.company}</Text>
            )}
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.subtitle}>Keep building those learning habits</Text>
          </View>
        </View>

        {/* Ongoing Learning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ongoing Learning</Text>
          {ongoingLearning.length === 0 ? (
            <View style={styles.noLearningContainer}>
              <Text style={styles.noLearningText}>No active learning tracks</Text>
              <Text style={styles.noLearningSubtext}>
                Add tracks from the Tracks tab to start your learning journey
              </Text>
            </View>
          ) : (
          {ongoingLearning.map((track, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.trackCard}
              onPress={() => router.push('/tracks')}
            >
              <View style={styles.trackHeader}>
                <Award size={20} color={track.color} />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={styles.trackSubtitle}>{track.subtitle}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.playButton, { backgroundColor: track.color }]}
                  onPress={() => handlePlayQuiz(track.id)}
                >
                  <Play size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${(track.progress / track.total) * 100}%`,
                        backgroundColor: track.color
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {track.progress}/{track.total} days • {track.daysLeft} days left
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          )}
          
          {/* Browse Tracks Button */}
          <TouchableOpacity 
            style={styles.browseTracksButton}
            onPress={() => router.push('/tracks')}
          >
            <Text style={styles.browseTracksText}>Browse All Tracks</Text>
            <ChevronRight size={16} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Learning Activity Graph */}
        <View style={styles.section}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Learning Activity</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakNumber}>{streakData.current}</Text>
              <Text style={styles.streakText}>day streak</Text>
            </View>
          </View>
          <View style={styles.activityGraphCard}>
            <View style={styles.contributionGraph}>
              <View style={styles.monthsRow}>
                {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].map((month, index) => (
                  <Text key={index} style={styles.monthLabel}>{month}</Text>
                ))}
              </View>
              <View style={styles.graphGrid}>
                {generateActivityData().map((week, weekIndex) => (
                  <View key={weekIndex} style={styles.weekColumn}>
                    {week.map((day, dayIndex) => (
                      <View
                        key={dayIndex}
                        style={[
                          styles.daySquare,
                          { backgroundColor: getDayColor(day.activity) }
                        ]}
                      />
                    ))}
                  </View>
                ))}
              </View>
              <View style={styles.graphLegend}>
                <Text style={styles.legendText}>Less</Text>
                <View style={styles.legendSquares}>
                  <View style={[styles.legendSquare, { backgroundColor: '#ebedf0' }]} />
                  <View style={[styles.legendSquare, { backgroundColor: '#c6e48b' }]} />
                  <View style={[styles.legendSquare, { backgroundColor: '#7bc96f' }]} />
                  <View style={[styles.legendSquare, { backgroundColor: '#239a3b' }]} />
                  <View style={[styles.legendSquare, { backgroundColor: '#196127' }]} />
                </View>
                <Text style={styles.legendText}>More</Text>
              </View>
            </View>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '400',
  },
  streakBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  streakText: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.95,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  trackSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  browseTracksButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  browseTracksText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
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
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  activityGraphCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  contributionGraph: {
    alignItems: 'center',
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: screenWidth - 88,
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  graphGrid: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 12,
    width: screenWidth - 88,
    justifyContent: 'space-between',
  },
  weekColumn: {
    flexDirection: 'column',
    gap: 3,
  },
  daySquare: {
    width: Math.floor((screenWidth - 88 - (25 * 3)) / 26),
    height: Math.floor((screenWidth - 88 - (25 * 3)) / 26),
    borderRadius: 2,
  },
  graphLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  legendSquares: {
    flexDirection: 'row',
    gap: 2,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 1,
  },
  noLearningContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  noLearningText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  noLearningSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});