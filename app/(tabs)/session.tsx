import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, Clock, Target, CircleCheck as CheckCircle, Brain, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SessionScreen() {
  const [selectedTrack, setSelectedTrack] = useState('data-analysis');
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [quizResults, setQuizResults] = useState<{
    correct: number;
    total: number;
  }>({
    correct: 0,
    total: 0,
  });

  const tracks = [
    {
      id: 'data-analysis',
      title: 'Data Analysis Fundamentals',
      color: '#3b82f6',
      questions: [
        {
          question: "What is the primary purpose of data cleaning in analysis?",
          options: [
            "To make data look prettier",
            "To remove errors and inconsistencies",
            "To reduce file size",
            "To encrypt sensitive information"
          ],
          correct: 1
        },
        {
          question: "Which visualization is best for showing trends over time?",
          options: [
            "Pie chart",
            "Bar chart",
            "Line chart",
            "Scatter plot"
          ],
          correct: 2
        },
        {
          question: "What does correlation measure?",
          options: [
            "Causation between variables",
            "The strength of relationship between variables",
            "The average of a dataset",
            "The size of a dataset"
          ],
          correct: 1
        }
      ]
    },
    {
      id: 'sdr-basics',
      title: 'SDR Basics',
      color: '#10b981',
      questions: [
        {
          question: "What is the most important element of a cold email?",
          options: [
            "Company logo",
            "Personalized subject line",
            "Long detailed description",
            "Multiple call-to-actions"
          ],
          correct: 1
        },
        {
          question: "How many touchpoints should an SDR sequence typically have?",
          options: [
            "2-3 touchpoints",
            "5-8 touchpoints",
            "10+ touchpoints",
            "Just one perfect email"
          ],
          correct: 1
        },
        {
          question: "What's the best time to follow up after no response?",
          options: [
            "Immediately",
            "2-3 business days",
            "1 week",
            "Never follow up"
          ],
          correct: 1
        }
      ]
    },
    {
      id: 'customer-success',
      title: 'Customer Success Foundations',
      color: '#f59e0b',
      questions: [
        {
          question: "What is the primary goal of customer success?",
          options: [
            "Increase sales revenue",
            "Reduce support tickets",
            "Ensure customers achieve their desired outcomes",
            "Collect customer feedback"
          ],
          correct: 2
        },
        {
          question: "When should you start the customer success process?",
          options: [
            "After the customer complains",
            "During onboarding",
            "At contract renewal",
            "When they request help"
          ],
          correct: 1
        },
        {
          question: "What is a leading indicator of customer churn?",
          options: [
            "High product usage",
            "Frequent support contacts",
            "Declining engagement metrics",
            "Positive feedback scores"
          ],
          correct: 2
        }
      ]
    },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && sessionStarted) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    } else if (!isActive && time !== 0) {
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, sessionStarted, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    setSessionStarted(true);
    setShowQuiz(true);
    setIsActive(true);
    setTime(0);
    setSessionCompleted(false);
    setSelectedAnswer(null);
    setCurrentQuestion(null);
    setQuizResults({
      correct: 0,
      total: 0,
    });
    generateNextQuestion();
  };

  const generateNextQuestion = () => {
    const currentTrack = tracks.find(t => t.id === selectedTrack);
    if (currentTrack) {
      // Randomly select a question from the track
      const randomIndex = Math.floor(Math.random() * currentTrack.questions.length);
      setCurrentQuestion(currentTrack.questions[randomIndex]);
      setSelectedAnswer(null);
    }
  };

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion?.correct;

    const newResults = {
      ...quizResults,
      correct: quizResults.correct + (isCorrect ? 1 : 0),
      total: quizResults.total + 1,
    };

    setQuizResults(newResults);
    
    // Generate next question automatically
    generateNextQuestion();
    
    // Check for badge eligibility after each correct answer
    if (isCorrect) {
      checkBadgeEligibility(newResults);
    }
  };

  const checkBadgeEligibility = (results: { correct: number; total: number }) => {
    // Check for quiz-related badges
    if (results.correct === 1 && results.total === 1) {
      // First correct answer - could award "Quiz Starter" badge
      console.log('Eligible for Quiz Starter badge');
    }
    
    if (results.total >= 10 && (results.correct / results.total) >= 0.9) {
      // High performance on 10+ questions - could award "Quiz Ace" badge
      console.log('Eligible for Quiz Ace badge');
    }
  };

  const finishQuiz = () => {
    const finalQuizResults = quizResults;
    const results = finalQuizResults || quizResults;
    const successRate = results.total > 0 ? (results.correct / results.total) * 100 : 0;

    // Streak logic - only increment once per day per track
    const updateStreakData = async () => {
      try {
        const today = new Date().toDateString();
        const lastSessionDate = await AsyncStorage.getItem(`lastSession_${selectedTrack}`);
        const currentStreakStr = await AsyncStorage.getItem(`streak_${selectedTrack}`);
        const currentStreak = currentStreakStr ? parseInt(currentStreakStr) : 0;
        
        let newStreak = currentStreak;
        let streakIncremented = false;
        let badgesEarned = [];
        
        if (lastSessionDate !== today) {
          // Only increment streak if this is the first session today and score >= 80%
          if (successRate >= 80) {
            newStreak = currentStreak + 1;
            streakIncremented = true;
            await AsyncStorage.setItem(`streak_${selectedTrack}`, newStreak.toString());
            await AsyncStorage.setItem(`lastSession_${selectedTrack}`, today);
            
            // Check for streak-based badges
            if (newStreak === 7) {
              badgesEarned.push('Week Warrior');
              console.log('Badge earned: Week Warrior');
            } else if (newStreak === 21) {
              badgesEarned.push('Consistency Champion');
              console.log('Badge earned: Consistency Champion');
            }
          }
        } else if (successRate >= 80) {
          // If already completed today but with good score, keep current streak
          newStreak = currentStreak + 1;
          streakIncremented = false; // Don't increment again
        }
        
        // Store session data
        const sessionData = {
          duration: time,
          successRate,
          questionsCorrect: results.correct,
          questionsTotal: results.total,
          streak: newStreak,
          streakIncremented,
          meetsThreshold: successRate >= 80,
          badgesEarned,
        };
        
        console.log('Session completed with data:', sessionData);
      } catch (error) {
        console.error('Error updating streak data:', error);
      }
    };

    setIsActive(false);
    setSessionCompleted(true);
    setShowQuiz(false);
    updateStreakData();
  };


  const resetSession = () => {
    setIsActive(false);
    setTime(0);
    setSessionStarted(false);
    setSessionCompleted(false);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setCurrentQuestion(null);
    setQuizResults({
      correct: 0,
      total: 0,
    });
  };

  const selectedTrackData = tracks.find(t => t.id === selectedTrack);

  if (sessionCompleted) {
    const successRate = quizResults.total > 0 ? (quizResults.correct / quizResults.total) * 100 : 0;
    const meetsThreshold = successRate >= 80;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContainer}>
          <CheckCircle size={64} color={meetsThreshold ? "#10b981" : "#f59e0b"} />
          <Text style={styles.completedTitle}>
            {meetsThreshold ? "Excellent Work!" : "Keep Practicing!"}
          </Text>
          <Text style={styles.completedSubtitle}>
            {formatTime(time)} session completed
          </Text>
          
          <View style={styles.sessionSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Track</Text>
              <Text style={styles.summaryValue}>{selectedTrackData?.title}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{formatTime(time)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Quiz Score</Text>
              <Text style={[styles.summaryValue, { color: successRate >= 80 ? '#10b981' : '#ef4444' }]}>
                {quizResults.correct}/{quizResults.total} ({Math.round(successRate)}%)
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Questions Answered</Text>
              <Text style={styles.summaryValue}>{quizResults.total}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text style={[styles.summaryValue, { color: meetsThreshold ? '#10b981' : '#ef4444' }]}>
                {meetsThreshold ? '✓ Daily Streak +1! Progress toward next level' : '✗ Need 80%+ to earn streak'}
              </Text>
            </View>
            {!meetsThreshold && (
              <View>
                <Text style={styles.retakeMessage}>
                  Retake the quiz today or tomorrow to earn your daily streak and progress toward credentials.
                </Text>
              </View>
            )}
            {/* Show any badges earned */}
            {finalSessionData?.badgesEarned && finalSessionData.badgesEarned.length > 0 && (
              <View style={styles.badgesEarned}>
                <Text style={styles.badgesEarnedTitle}>🏆 Badges Earned!</Text>
                {finalSessionData.badgesEarned.map((badge, index) => (
                  <Text key={index} style={styles.badgeEarnedText}>
                    ✨ {badge}
                  </Text>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.newSessionButton}
            onPress={resetSession}
          >
            <Text style={styles.newSessionButtonText}>Start New Session</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showQuiz) {
    if (!currentQuestion) {
      return null; // Loading state
    }

    return (
      <SafeAreaView style={styles.container}>
        {/* Timer Header */}
        <View style={styles.quizTimerHeader}>
          <View style={styles.timerDisplay}>
            <Clock size={16} color={selectedTrackData?.color} />
            <Text style={[styles.timerHeaderText, { color: selectedTrackData?.color }]}>
              {formatTime(time)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.pauseButton, { backgroundColor: selectedTrackData?.color }]}
            onPress={() => setIsActive(!isActive)}
          >
            {isActive ? (
              <Pause size={16} color="#ffffff" />
            ) : (
              <Play size={16} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.quizContainer}>
          <View style={styles.quizHeader}>
            <Text style={styles.quizTitle}>Knowledge Check</Text>
            <Text style={styles.quizSubtitle}>
              Questions Answered: {quizResults.total} | Correct: {quizResults.correct}
            </Text>
          </View>

          <View style={styles.questionContainer}>
            <Brain size={32} color={selectedTrackData?.color} />
            <Text style={styles.questionText}>{currentQuestion?.question}</Text>
          </View>

          <View style={styles.answersContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.answerOption,
                  selectedAnswer === index && { 
                    borderColor: selectedTrackData?.color,
                    backgroundColor: `${selectedTrackData?.color}10`
                  }
                ]}
                onPress={() => selectAnswer(index)}
              >
                <View style={[
                  styles.answerRadio,
                  selectedAnswer === index && { backgroundColor: selectedTrackData?.color }
                ]}>
                  {selectedAnswer === index && <View style={styles.answerRadioInner} />}
                </View>
                <Text style={[
                  styles.answerText,
                  selectedAnswer === index && { color: selectedTrackData?.color, fontWeight: '600' }
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: selectedTrackData?.color },
              selectedAnswer === null && { opacity: 0.5 }
            ]}
            onPress={submitAnswer}
            disabled={selectedAnswer === null}
          >
            <Text style={styles.submitButtonText}>
              Next Question
            </Text>
            <ArrowRight size={16} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.quizFooter}>
            <View style={styles.quizStats}>
              <Text style={styles.quizStatsText}>
                Current Score: {quizResults.total > 0 ? Math.round((quizResults.correct / quizResults.total) * 100) : 0}%
              </Text>
            </View>
            <TouchableOpacity style={styles.finishButton} onPress={finishQuiz}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.finishButtonText}>Finish Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Session</Text>
        <Text style={styles.headerSubtitle}>
          {sessionStarted ? 'Session in progress' : 'Choose your track and start learning'}
        </Text>
      </View>

      {!sessionStarted && (
        <View style={styles.trackSelector}>
          <Text style={styles.sectionTitle}>Select Track</Text>
          {tracks.map((track) => (
            <TouchableOpacity
              key={track.id}
              style={[
                styles.trackOption,
                selectedTrack === track.id && { 
                  borderColor: track.color,
                  backgroundColor: `${track.color}10`
                }
              ]}
              onPress={() => setSelectedTrack(track.id)}
            >
              <View style={styles.trackOptionContent}>
                <Target size={20} color={track.color} />
                <Text style={styles.trackOptionText}>{track.title}</Text>
                {selectedTrack === track.id && (
                  <CheckCircle size={20} color={track.color} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.controls}>
        {!sessionStarted ? (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: selectedTrackData?.color }]}
            onPress={startSession}
          >
            <Play size={24} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Start Quiz & Timer</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {!sessionStarted && (
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionInfoText}>
            💡 Answer quiz questions while the timer tracks your practice time
          </Text>
          <Text style={styles.sessionTip}>
            Complete sessions earn +1 streak and count towards your credentials
          </Text>
        </View>
      )}
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
  trackSelector: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  trackOption: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  trackOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trackOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  controls: {
    padding: 20,
  },
  primaryButton: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  sessionInfo: {
    padding: 20,
    alignItems: 'center',
  },
  sessionInfoText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  sessionTip: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  sessionSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 32,
    minWidth: '100%',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  newSessionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 32,
  },
  newSessionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  retakeMessage: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  badgesEarned: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  badgesEarnedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeEarnedText: {
    fontSize: 12,
    color: '#15803d',
    textAlign: 'center',
  },
  quizTimerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizContainer: {
    flex: 1,
    padding: 20,
  },
  quizHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  quizSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  quizProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 16,
  },
  answersContainer: {
    flex: 1,
    gap: 12,
  },
  answerOption: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  answerRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 22,
  },
  submitButton: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  quizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  quizStats: {
    flex: 1,
  },
  quizStatsText: {
    fontSize: 14,
    color: '#64748b',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  finishButtonText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
});