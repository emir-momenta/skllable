import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, PanGestureHandler, State } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, ChevronRight, Play, ChevronLeft, BarChart3, UserCheck, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

/**
 * GitHub-style Activity Heatmap Generator
 * Creates a 6-month sliding view centered around current date
 * All activity data comes from user streaks, no predetermined data
 */

// Generate 6-month activity calendar (3 months back, current month, 2 months forward)
const generateActivityCalendar = (centerDate, userStreakData = {}) => {
  const weeks = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate start date (3 months back from center date)
  const startDate = new Date(centerDate);
  startDate.setMonth(startDate.getMonth() - 3);
  startDate.setDate(1); // Start from first day of the month
  
  // Calculate end date (2 months forward from center date)
  const endDate = new Date(centerDate);
  endDate.setMonth(endDate.getMonth() + 2);
  endDate.setDate(new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate()); // Last day of month
  
  // Find the first Sunday on or before start date to align with week grid
  const firstSunday = new Date(startDate);
  firstSunday.setDate(startDate.getDate() - startDate.getDay());
  
  // Generate weeks for the 6-month period
  let currentDate = new Date(firstSunday);
  
  while (currentDate <= endDate) {
    const weekData = [];
    
    // Generate 7 days for this week
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dayDate = new Date(currentDate);
      dayDate.setDate(currentDate.getDate() + dayOfWeek);
      
      let activity = 0;
      
      // Check if this date has user activity from streaks
      const dateKey = dayDate.toDateString();
      if (userStreakData[dateKey]) {
        activity = Math.min(4, userStreakData[dateKey]); // Cap at level 4
      }
      
      weekData.push({
        date: new Date(dayDate),
        activity: activity,
        isInRange: dayDate >= startDate && dayDate <= endDate,
        isFuture: dayDate > new Date(),
        isToday: dayDate.toDateString() === new Date().toDateString()
      });
    }
    
    weeks.push(weekData);
    currentDate.setDate(currentDate.getDate() + 7); // Move to next week
  }
  
  // Generate month labels
  const monthLabels = [];
  let currentMonth = -1;
  let weekIndex = 0;
  
  for (const week of weeks) {
    const firstDayInRange = week.find(day => day.isInRange);
    if (firstDayInRange) {
      const month = firstDayInRange.date.getMonth();
      if (month !== currentMonth) {
        monthLabels.push({
          name: monthNames[month],
          weekIndex: weekIndex,
          month: month
        });
        currentMonth = month;
      }
    }
    weekIndex++;
  }
  
  return { weeks, monthLabels };
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
  const [heatmapData, setHeatmapData] = useState<{ weeks: any[], monthLabels: any[] }>({ weeks: [], monthLabels: [] });
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [streakData, setStreakData] = useState({ completedDays: 0, currentStreak: 12 });
  
  // Animation values for sliding
  const translateX = useSharedValue(0);
  const gestureActive = useSharedValue(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Generate heatmap data when view date or streak data changes
  useEffect(() => {
    const loadUserStreakData = async () => {
      try {
        // Load actual user streak data from AsyncStorage
        const userStreakData = {};
        const addedTracksData = await AsyncStorage.getItem('addedTracks');
        
        if (addedTracksData) {
          const addedTracks = JSON.parse(addedTracksData);
          
          // For each track, get the streak data and map to dates
          for (const trackId of addedTracks) {
            const streakStr = await AsyncStorage.getItem(`streak_${trackId}`);
            const streak = streakStr ? parseInt(streakStr) : 0;
            
            // Add activity for each day in the streak (working backwards from today)
            for (let i = 0; i < streak; i++) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              const dateKey = date.toDateString();
              
              // Increment activity level for this date (multiple tracks can contribute)
              userStreakData[dateKey] = (userStreakData[dateKey] || 0) + 1;
            }
          }
        }
        
        const calendarData = generateActivityCalendar(currentViewDate, userStreakData);
        const monthLabels = generateMonthLabels(calendarData.weeks);
        setHeatmapData({ ...calendarData, monthLabels });
      } catch (error) {
        console.error('Error loading streak data for heatmap:', error);
        // Fallback to empty calendar
        const calendarData = generateActivityCalendar(currentViewDate, {});
        const monthLabels = generateMonthLabels(calendarData.weeks);
        setHeatmapData({ ...calendarData, monthLabels });
      }
    };
    
    loadUserStreakData();
  }, [currentViewDate, streakData]);

  // Navigation functions
  const navigateToTimeOffset = (monthsOffset: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const newDate = new Date(currentViewDate);
    newDate.setMonth(newDate.getMonth() + monthsOffset);
    setCurrentViewDate(newDate);
    
    // Reset animation after transition
    setTimeout(() => {
      setIsTransitioning(false);
      translateX.value = 0;
    }, 300);
  };

  // Reset to today
  const resetToToday = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentViewDate(new Date());
    translateX.value = withSpring(0);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  // Pan gesture handler for natural sliding
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      gestureActive.value = true;
    },
    onActive: (event) => {
      // Allow horizontal sliding with resistance at edges
      const maxTranslate = 150;
      const resistance = 0.7;
      
      if (Math.abs(event.translationX) > maxTranslate) {
        translateX.value = event.translationX > 0 
          ? maxTranslate + (event.translationX - maxTranslate) * resistance
          : -maxTranslate + (event.translationX + maxTranslate) * resistance;
      } else {
        translateX.value = event.translationX;
      }
    },
    onEnd: (event) => {
      gestureActive.value = false;
      
      // Determine if swipe was significant enough to navigate
      const threshold = 80;
      const velocity = event.velocityX;
      
      if (Math.abs(event.translationX) > threshold || Math.abs(velocity) > 500) {
        if (event.translationX > 0 || velocity > 500) {
          // Swipe right - go to previous period
          runOnJS(navigateToTimeOffset)(-3);
        } else {
          // Swipe left - go to next period
          runOnJS(navigateToTimeOffset)(3);
        }
      } else {
        // Snap back to center
        translateX.value = withSpring(0);
      }
    },
  });

  // Animated style for the heatmap container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Generate month labels with proper spacing to prevent overlap
  const generateMonthLabels = (weeks: any[]) => {
    const monthLabels = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let currentMonth = -1;
    let weekIndex = 0;
    const minSpacing = 4; // Minimum weeks between labels
    let lastLabelWeek = -minSpacing;
    
    for (const week of weeks) {
      const firstDayInRange = week.find(day => day.isInRange);
      if (firstDayInRange) {
        const month = firstDayInRange.date.getMonth();
        if (month !== currentMonth && weekIndex - lastLabelWeek >= minSpacing) {
          monthLabels.push({
            name: monthNames[month],
            weekIndex: weekIndex,
            month: month
          });
          currentMonth = month;
          lastLabelWeek = weekIndex;
        }
      }
      weekIndex++;
    }
    
    return monthLabels;
  };

  // Load streak data from AsyncStorage
  useEffect(() => {
    const loadStreakData = async () => {
      try {
        const addedTracksData = await AsyncStorage.getItem('addedTracks');
        if (addedTracksData) {
          const addedTracks = JSON.parse(addedTracksData);
          let maxStreak = 0;
          
          for (const trackId of addedTracks) {
            const streakStr = await AsyncStorage.getItem(`streak_${trackId}`);
            const streak = streakStr ? parseInt(streakStr) : 0;
            maxStreak = Math.max(maxStreak, streak);
          }
          
          setStreakData({
            completedDays: 0, // Not used anymore
            currentStreak: maxStreak
          });
        }
      } catch (error) {
        console.error('Error loading streak data:', error);
      }
    };
    
    loadStreakData();
  }, [ongoingLearning]); // Reload when learning tracks change

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
          ongoingLearning.map((track, index) => (
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
          ))
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
              <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
              <Text style={styles.streakText}>day streak</Text>
            </View>
          </View>
          
          {/* Swipe Hint */}
          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintText}>← Swipe to navigate through time →</Text>
            <TouchableOpacity style={styles.todayButton} onPress={resetToToday}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityGraphCard}>
            <PanGestureHandler onGestureEvent={panGestureHandler}>
              <Animated.View style={[styles.heatmapContainer, animatedStyle]}>
                <View style={styles.contributionGraph}>
                  {/* Month Labels with Anti-Overlap Logic */}
                  <View style={styles.monthLabelsContainer}>
                    {heatmapData.monthLabels.map((month, index) => (
                      <Text 
                        key={`${month.month}-${index}`}
                        style={[
                          styles.monthLabel,
                          { left: Math.min(month.weekIndex * 14, 260) }
                        ]}
                      >
                        {month.name}
                      </Text>
                    ))}
                  </View>
                  
                  {/* Heatmap Grid */}
                  <View style={styles.graphGrid}>
                    {heatmapData.weeks.map((week, weekIndex) => (
                      <View key={weekIndex} style={styles.weekColumn}>
                        {week.map((day, dayIndex) => (
                          <View
                            key={dayIndex}
                            style={[
                              styles.daySquare,
                              { 
                                backgroundColor: getDayColor(day.activity),
                                opacity: day.isInRange ? 1 : 0.3,
                                borderWidth: day.isToday ? 2 : 0,
                                borderColor: day.isToday ? '#3b82f6' : 'transparent'
                              }
                            ]}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                  
                  {/* Legend */}
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
              </Animated.View>
            </PanGestureHandler>
            
            {/* Activity Summary */}
            <View style={styles.activitySummary}>
              <Text style={styles.activitySummaryText}>
                6-month view • Current streak: {streakData.currentStreak} days • Swipe to navigate
              </Text>
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
    overflow: 'hidden',
    maxWidth: '100%',
  },
  heatmapContainer: {
    overflow: 'hidden',
    maxWidth: '100%',
    contain: 'layout',
  },
  sliderContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    width: '100%',
    maxWidth: 280,
  },
  sliderText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  customSlider: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    position: 'relative',
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  swipeHint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  swipeHintText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  todayButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  contributionGraph: {
    alignItems: 'flex-start',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  monthLabelsContainer: {
    position: 'relative',
    width: 300,
    maxWidth: '100%',
    height: 20,
    marginBottom: 8,
    overflow: 'hidden',
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  graphGrid: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 12,
    maxWidth: 300,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  weekColumn: {
    flexDirection: 'column',
    gap: 2,
    minWidth: 12,
  },
  daySquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  graphLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
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
  activitySummary: {
    marginTop: 12,
    alignItems: 'center',
  },
  activitySummaryText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
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