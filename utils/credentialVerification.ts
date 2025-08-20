export interface CredentialData {
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
}

export interface SessionData {
  id: string;
  trackId: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  isValid: boolean;
  quizScore?: number; // percentage (0-100)
  avgResponseTime?: number; // seconds
  questionsCorrect?: number;
  questionsTotal?: number;
}

export class CredentialSystem {
  private static readonly MIN_SESSION_DURATION = 15; // minutes
  private static readonly MAX_SESSION_DURATION = 180; // 3 hours
  private static readonly COOLDOWN_PERIOD = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  
  // Intent Level: 7 consecutive days
  private static readonly INTENT_REQUIRED_DAYS = 7;
  
  // Practice Level: 90 days within 120 day window (75% consistency)
  private static readonly PRACTICE_REQUIRED_DAYS = 90;
  private static readonly PRACTICE_WINDOW_DAYS = 120;
  
  // Performance Level: 365 days within 400 day window (91% consistency)
  private static readonly PERFORMANCE_REQUIRED_DAYS = 365;
  private static readonly PERFORMANCE_WINDOW_DAYS = 400;

  /**
   * Validates a learning session for integrity
   */
  static validateSession(session: Partial<SessionData>, previousSessions: SessionData[]): {
    isValid: boolean;
    reason?: string;
    qualityScore?: number;
  } {
    // Check minimum duration
    if (!session.duration || session.duration < this.MIN_SESSION_DURATION) {
      return {
        isValid: false,
        reason: `Session must be at least ${this.MIN_SESSION_DURATION} minutes`
      };
    }

    // Check maximum duration
    if (session.duration > this.MAX_SESSION_DURATION) {
      return {
        isValid: false,
        reason: `Session cannot exceed ${this.MAX_SESSION_DURATION} minutes`
      };
    }

    // Check cooldown period
    const sessionTime = new Date(session.startTime!).getTime();
    const recentSessions = previousSessions.filter(s => {
      const prevTime = new Date(s.endTime).getTime();
      return sessionTime - prevTime < this.COOLDOWN_PERIOD;
    });

    if (recentSessions.length > 0) {
      return {
        isValid: false,
        reason: 'Please wait at least 4 hours between sessions'
      };
    }

    // Calculate quality score based on quiz performance and time
    let qualityScore = 1.0; // Base score
    
    if (session.quizScore !== undefined) {
      // Quiz score contributes 60% to quality
      const quizWeight = session.quizScore / 100 * 0.6;
      
      // Response time contributes 40% to quality (faster = better, up to a point)
      let timeWeight = 0.4;
      if (session.avgResponseTime !== undefined) {
        // Optimal response time is 5-15 seconds
        const optimalTime = 10;
        const timeDiff = Math.abs(session.avgResponseTime - optimalTime);
        timeWeight = Math.max(0.1, 0.4 - (timeDiff / 30)); // Penalty for too fast or too slow
      }
      
      qualityScore = quizWeight + timeWeight;
    }

    return { 
      isValid: true, 
      qualityScore: Math.max(0.3, Math.min(1.0, qualityScore)) // Clamp between 0.3 and 1.0
    };
  }

  /**
   * Calculates Intent credential eligibility (7 consecutive days with quality weighting)
   */
  static checkIntentEligibility(sessions: SessionData[]): {
    eligible: boolean;
    currentStreak: number;
    requiredStreak: number;
    qualityScore: number;
  } {
    const validSessions = sessions.filter(s => s.isValid);
    const streak = this.calculateCurrentStreak(validSessions);
    const avgQuality = this.calculateAverageQuality(validSessions);
    
    return {
      eligible: streak >= this.INTENT_REQUIRED_DAYS,
      currentStreak: streak,
      requiredStreak: this.INTENT_REQUIRED_DAYS,
      qualityScore: avgQuality
    };
  }

  /**
   * Calculates Practice credential eligibility (90 days in 120 day window with quality weighting)
   */
  static checkPracticeEligibility(sessions: SessionData[]): {
    eligible: boolean;
    activeDays: number;
    requiredDays: number;
    windowDays: number;
    qualityScore: number;
  } {
    const validSessions = sessions.filter(s => s.isValid);
    const now = new Date();
    const windowStart = new Date(now.getTime() - (this.PRACTICE_WINDOW_DAYS * 24 * 60 * 60 * 1000));
    
    const recentSessions = validSessions.filter(s => 
      new Date(s.startTime) >= windowStart
    );
    
    const activeDays = this.getUniqueDays(recentSessions).length;
    const avgQuality = this.calculateAverageQuality(recentSessions);
    
    // Quality threshold: need at least 75% average quality for Practice level
    const qualityThreshold = 0.75;
    const meetsQualityThreshold = avgQuality >= qualityThreshold;
    
    return {
      eligible: activeDays >= this.PRACTICE_REQUIRED_DAYS && meetsQualityThreshold,
      activeDays,
      requiredDays: this.PRACTICE_REQUIRED_DAYS,
      windowDays: this.PRACTICE_WINDOW_DAYS,
      qualityScore: avgQuality
    };
  }

  /**
   * Calculates Performance credential eligibility (365 days in 400 day window with quality weighting)
   */
  static checkPerformanceEligibility(sessions: SessionData[]): {
    eligible: boolean;
    activeDays: number;
    requiredDays: number;
    windowDays: number;
    qualityScore: number;
  } {
    const validSessions = sessions.filter(s => s.isValid);
    const now = new Date();
    const windowStart = new Date(now.getTime() - (this.PERFORMANCE_WINDOW_DAYS * 24 * 60 * 60 * 1000));
    
    const recentSessions = validSessions.filter(s => 
      new Date(s.startTime) >= windowStart
    );
    
    const activeDays = this.getUniqueDays(recentSessions).length;
    const avgQuality = this.calculateAverageQuality(recentSessions);
    
    // Quality threshold: need at least 80% average quality for Performance level
    const qualityThreshold = 0.80;
    const meetsQualityThreshold = avgQuality >= qualityThreshold;
    
    return {
      eligible: activeDays >= this.PERFORMANCE_REQUIRED_DAYS && meetsQualityThreshold,
      activeDays,
      requiredDays: this.PERFORMANCE_REQUIRED_DAYS,
      windowDays: this.PERFORMANCE_WINDOW_DAYS,
      qualityScore: avgQuality
    };
  }

  /**
   * Calculates average quality score from sessions
   */
  private static calculateAverageQuality(sessions: SessionData[]): number {
    if (sessions.length === 0) return 0;
    
    const sessionsWithQuiz = sessions.filter(s => s.quizScore !== undefined);
    if (sessionsWithQuiz.length === 0) return 0.5; // Default quality for sessions without quiz
    
    const totalQuality = sessionsWithQuiz.reduce((sum, session) => {
      let quality = (session.quizScore || 0) / 100 * 0.6; // Quiz contributes 60%
      
      // Response time contributes 40%
      if (session.avgResponseTime !== undefined) {
        const optimalTime = 10;
        const timeDiff = Math.abs(session.avgResponseTime - optimalTime);
        const timeQuality = Math.max(0.1, 0.4 - (timeDiff / 30));
        quality += timeQuality;
      } else {
        quality += 0.2; // Default time quality if not available
      }
      
      return sum + Math.max(0.3, Math.min(1.0, quality));
    }, 0);
    
    return totalQuality / sessionsWithQuiz.length;
  }

  /**
   * Calculates current consecutive day streak
   */
  private static calculateCurrentStreak(sessions: SessionData[]): number {
    if (sessions.length === 0) return 0;

    const uniqueDays = this.getUniqueDays(sessions).sort((a, b) => b.localeCompare(a));
    let streak = 0;
    const today = new Date().toDateString();
    let checkDate = today;

    for (const day of uniqueDays) {
      if (day === checkDate) {
        streak++;
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        checkDate = prevDate.toDateString();
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Gets unique days from sessions
   */
  private static getUniqueDays(sessions: SessionData[]): string[] {
    const days = sessions.map(s => new Date(s.startTime).toDateString());
    return [...new Set(days)];
  }

  /**
   * Generates a credential verification ID
   */
  static generateCredentialId(trackId: string, level: string): string {
    const trackCode = trackId.substring(0, 2).toUpperCase();
    const levelCode = level.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return `${trackCode}-${levelCode}-${year}-${random}`;
  }

  /**
   * Validates credential authenticity
   */
  static validateCredential(credentialId: string): {
    isValid: boolean;
    reason?: string;
  } {
    // Basic format validation
    const pattern = /^[A-Z]{2}-[A-Z]{3}-\d{4}-[A-Z0-9]{6}$/;
    
    if (!pattern.test(credentialId)) {
      return {
        isValid: false,
        reason: 'Invalid credential format'
      };
    }

    // In a real implementation, you would check against a database
    return { isValid: true };
  }

  /**
   * Generates timeline data for public verification
   */
  static generateTimelineData(sessions: SessionData[], credentialDate: string): Array<{
    week: string;
    active: boolean;
  }> {
    const startDate = new Date(credentialDate);
    const endDate = new Date();
    const timeline = [];
    
    // Calculate weeks from credential date to now
    let currentWeek = new Date(startDate);
    while (currentWeek <= endDate) {
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekSessions = sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= currentWeek && sessionDate <= weekEnd;
      });
      
      timeline.push({
        week: currentWeek.toISOString().substring(0, 10),
        active: weekSessions.length > 0
      });
      
      currentWeek.setDate(currentWeek.getDate() + 7);
    }
    
    return timeline;
  }
}

/**
 * LinkedIn integration helper
 */
export class LinkedInIntegration {
  /**
   * Generates LinkedIn certification URL
   */
  static generateLinkedInUrl(credential: {
    trackTitle: string;
    level: string;
    earnedDate: string;
    verificationId: string;
  }): string {
    const certificationName = `Skllable ${credential.level} - ${credential.trackTitle}`;
    const issueDate = new Date(credential.earnedDate);
    const verificationUrl = `https://verify.skllable.com/credential/${credential.verificationId}`;
    
    const params = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: certificationName,
      organizationName: 'Skllable',
      issueYear: issueDate.getFullYear().toString(),
      issueMonth: (issueDate.getMonth() + 1).toString(),
      certUrl: verificationUrl,
    });
    
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  }
}

/**
 * Public verification page data generator
 */
export function generateVerificationPageData(
  credentialId: string,
  sessions: SessionData[]
): CredentialData | null {
  // In a real implementation, this would fetch from a secure database
  // This is mock data for demonstration
  
  if (credentialId === 'DA-INT-2024-789ABC') {
    return {
      id: credentialId,
      trackTitle: 'Data Analysis Fundamentals',
      level: 'Intent',
      learnerName: 'Alex Johnson',
      earnedDate: '2024-12-15',
      validUntil: '2025-12-15',
      isActive: true,
      stats: {
        totalDays: 7,
        totalHours: 3.5,
        longestStreak: 7,
        averageSession: 30,
      },
      timeline: CredentialSystem.generateTimelineData(sessions, '2024-12-15'),
    };
  }
  
  return null;
}