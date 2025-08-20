export interface Badge {
  id: string;
  title: string;
  description: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Challenger';
  points: number;
  earned: boolean;
  earnedDate?: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  category: string;
  criteria: {
    type: 'streak' | 'sessions' | 'credentials' | 'quiz_score' | 'time' | 'consistency';
    value: number;
    operator: '>=' | '>' | '=' | '<' | '<=';
    timeframe?: 'day' | 'week' | 'month' | 'all_time';
  };
}

export interface BadgeTier {
  name: string;
  color: string;
  minPoints: number;
  benefits: string[];
}

export class BadgeSystem {
  private static readonly TIERS: BadgeTier[] = [
    {
      name: 'Bronze',
      color: '#cd7f32',
      minPoints: 0,
      benefits: ['Basic achievement tracking', 'Profile customization']
    },
    {
      name: 'Silver',
      color: '#c0c0c0',
      minPoints: 100,
      benefits: ['Enhanced progress tracking', 'Weekly insights']
    },
    {
      name: 'Gold',
      color: '#ffd700',
      minPoints: 300,
      benefits: ['Advanced analytics', 'Priority support']
    },
    {
      name: 'Platinum',
      color: '#e5e4e2',
      minPoints: 600,
      benefits: ['Exclusive content access', 'Mentorship opportunities']
    },
    {
      name: 'Diamond',
      color: '#b9f2ff',
      minPoints: 1000,
      benefits: ['Leadership board recognition', 'Beta feature access']
    },
    {
      name: 'Challenger',
      color: '#ff6b6b',
      minPoints: 1500,
      benefits: ['Elite status', 'Direct feedback channel', 'Special events']
    }
  ];

  private static readonly BADGE_DEFINITIONS: Omit<Badge, 'earned' | 'earnedDate'>[] = [
    // Bronze Tier - Getting Started
    {
      id: 'first-session',
      title: 'First Steps',
      description: 'Completed your first learning session',
      tier: 'Bronze',
      points: 10,
      rarity: 'Common',
      category: 'Getting Started',
      criteria: { type: 'sessions', value: 1, operator: '>=' }
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Completed a session before 9 AM',
      tier: 'Bronze',
      points: 15,
      rarity: 'Common',
      category: 'Habits',
      criteria: { type: 'sessions', value: 1, operator: '>=' }
    },
    {
      id: 'quiz-starter',
      title: 'Quiz Starter',
      description: 'Answered your first 10 quiz questions',
      tier: 'Bronze',
      points: 10,
      rarity: 'Common',
      category: 'Learning',
      criteria: { type: 'quiz_score', value: 10, operator: '>=' }
    },

    // Silver Tier - Building Habits
    {
      id: 'week-warrior',
      title: 'Week Warrior',
      description: 'Maintained a 7-day learning streak',
      tier: 'Silver',
      points: 25,
      rarity: 'Common',
      category: 'Consistency',
      criteria: { type: 'streak', value: 7, operator: '>=' }
    },
    {
      id: 'quiz-ace',
      title: 'Quiz Ace',
      description: 'Achieved 90%+ score on 5 consecutive quizzes',
      tier: 'Silver',
      points: 30,
      rarity: 'Uncommon',
      category: 'Excellence',
      criteria: { type: 'quiz_score', value: 90, operator: '>=' }
    },
    {
      id: 'time-keeper',
      title: 'Time Keeper',
      description: 'Accumulated 10 hours of learning time',
      tier: 'Silver',
      points: 35,
      rarity: 'Common',
      category: 'Dedication',
      criteria: { type: 'time', value: 600, operator: '>=' } // 10 hours in minutes
    },

    // Gold Tier - Serious Commitment
    {
      id: 'intent-master',
      title: 'Intent Master',
      description: 'Earned your first Intent credential',
      tier: 'Gold',
      points: 50,
      rarity: 'Uncommon',
      category: 'Credentials',
      criteria: { type: 'credentials', value: 1, operator: '>=' }
    },
    {
      id: 'multi-track',
      title: 'Multi-Track Master',
      description: 'Active in 2+ tracks simultaneously',
      tier: 'Gold',
      points: 75,
      rarity: 'Uncommon',
      category: 'Exploration',
      criteria: { type: 'sessions', value: 2, operator: '>=' }
    },
    {
      id: 'consistency-champion',
      title: 'Consistency Champion',
      description: 'Maintained 21-day streak with 85%+ quiz average',
      tier: 'Gold',
      points: 100,
      rarity: 'Rare',
      category: 'Excellence',
      criteria: { type: 'consistency', value: 21, operator: '>=' }
    },

    // Platinum Tier - Advanced Achievement
    {
      id: 'practice-pioneer',
      title: 'Practice Pioneer',
      description: 'Earned your first Practice credential',
      tier: 'Platinum',
      points: 100,
      rarity: 'Rare',
      category: 'Credentials',
      criteria: { type: 'credentials', value: 1, operator: '>=' }
    },
    {
      id: 'marathon-learner',
      title: 'Marathon Learner',
      description: 'Completed 100+ learning sessions',
      tier: 'Platinum',
      points: 150,
      rarity: 'Rare',
      category: 'Dedication',
      criteria: { type: 'sessions', value: 100, operator: '>=' }
    },
    {
      id: 'speed-demon',
      title: 'Speed Demon',
      description: 'Completed 50 hours of learning in 30 days',
      tier: 'Platinum',
      points: 125,
      rarity: 'Epic',
      category: 'Intensity',
      criteria: { type: 'time', value: 3000, operator: '>=', timeframe: 'month' }
    },

    // Diamond Tier - Elite Performance
    {
      id: 'perfect-month',
      title: 'Perfect Month',
      description: 'Maintained 30-day streak with 90%+ quiz scores',
      tier: 'Diamond',
      points: 200,
      rarity: 'Epic',
      category: 'Excellence',
      criteria: { type: 'consistency', value: 30, operator: '>=' }
    },
    {
      id: 'triple-threat',
      title: 'Triple Threat',
      description: 'Earned Practice credentials in 3 different tracks',
      tier: 'Diamond',
      points: 250,
      rarity: 'Epic',
      category: 'Mastery',
      criteria: { type: 'credentials', value: 3, operator: '>=' }
    },
    {
      id: 'centurion',
      title: 'Centurion',
      description: 'Accumulated 100+ hours of learning time',
      tier: 'Diamond',
      points: 300,
      rarity: 'Legendary',
      category: 'Dedication',
      criteria: { type: 'time', value: 6000, operator: '>=' }
    },

    // Challenger Tier - Legendary Status
    {
      id: 'knowledge-champion',
      title: 'Knowledge Champion',
      description: 'Achieved 95%+ average quiz score across all tracks',
      tier: 'Challenger',
      points: 300,
      rarity: 'Legendary',
      category: 'Mastery',
      criteria: { type: 'quiz_score', value: 95, operator: '>=' }
    },
    {
      id: 'performance-master',
      title: 'Performance Master',
      description: 'Earned Performance credential in any track',
      tier: 'Challenger',
      points: 400,
      rarity: 'Legendary',
      category: 'Credentials',
      criteria: { type: 'credentials', value: 1, operator: '>=' }
    },
    {
      id: 'legend',
      title: 'Legend',
      description: 'Maintained 365-day learning streak',
      tier: 'Challenger',
      points: 500,
      rarity: 'Legendary',
      category: 'Consistency',
      criteria: { type: 'streak', value: 365, operator: '>=' }
    }
  ];

  /**
   * Get all badge definitions
   */
  static getAllBadges(): Omit<Badge, 'earned' | 'earnedDate'>[] {
    return this.BADGE_DEFINITIONS;
  }

  /**
   * Get tier information by name
   */
  static getTier(tierName: string): BadgeTier | null {
    return this.TIERS.find(tier => tier.name === tierName) || null;
  }

  /**
   * Get all tiers
   */
  static getAllTiers(): BadgeTier[] {
    return this.TIERS;
  }

  /**
   * Calculate current tier based on points
   */
  static getCurrentTier(points: number): BadgeTier {
    for (let i = this.TIERS.length - 1; i >= 0; i--) {
      if (points >= this.TIERS[i].minPoints) {
        return this.TIERS[i];
      }
    }
    return this.TIERS[0];
  }

  /**
   * Get next tier based on current points
   */
  static getNextTier(points: number): BadgeTier | null {
    const currentTier = this.getCurrentTier(points);
    const currentIndex = this.TIERS.findIndex(tier => tier.name === currentTier.name);
    return currentIndex < this.TIERS.length - 1 ? this.TIERS[currentIndex + 1] : null;
  }

  /**
   * Check if user qualifies for a badge based on their stats
   */
  static checkBadgeEligibility(
    badge: Omit<Badge, 'earned' | 'earnedDate'>,
    userStats: {
      totalSessions: number;
      totalHours: number;
      longestStreak: number;
      currentStreak: number;
      averageQuizScore: number;
      totalCredentials: number;
      credentialsByTrack: Record<string, number>;
      recentQuizScores: number[];
      sessionsThisMonth: number;
      hoursThisMonth: number;
    }
  ): boolean {
    const { criteria } = badge;
    let value: number;

    switch (criteria.type) {
      case 'sessions':
        value = criteria.timeframe === 'month' ? userStats.sessionsThisMonth : userStats.totalSessions;
        break;
      case 'time':
        value = criteria.timeframe === 'month' ? userStats.hoursThisMonth * 60 : userStats.totalHours * 60;
        break;
      case 'streak':
        value = userStats.longestStreak;
        break;
      case 'quiz_score':
        value = userStats.averageQuizScore;
        break;
      case 'credentials':
        value = userStats.totalCredentials;
        break;
      case 'consistency':
        // Special logic for consistency badges (streak + quiz score combination)
        const hasStreak = userStats.currentStreak >= criteria.value;
        const hasQuizScore = userStats.averageQuizScore >= 85; // Minimum for consistency
        return hasStreak && hasQuizScore;
      default:
        return false;
    }

    switch (criteria.operator) {
      case '>=': return value >= criteria.value;
      case '>': return value > criteria.value;
      case '=': return value === criteria.value;
      case '<': return value < criteria.value;
      case '<=': return value <= criteria.value;
      default: return false;
    }
  }

  /**
   * Award badge to user
   */
  static awardBadge(badgeId: string, userId: string): Badge | null {
    const badgeDefinition = this.BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!badgeDefinition) return null;

    const badge: Badge = {
      ...badgeDefinition,
      earned: true,
      earnedDate: new Date().toISOString()
    };

    // In a real app, you would save this to a database
    console.log(`Badge awarded: ${badge.title} to user ${userId}`);
    
    return badge;
  }

  /**
   * Calculate total points from earned badges
   */
  static calculateTotalPoints(earnedBadges: Badge[]): number {
    return earnedBadges.reduce((total, badge) => total + badge.points, 0);
  }

  /**
   * Get badges by category
   */
  static getBadgesByCategory(category: string): Omit<Badge, 'earned' | 'earnedDate'>[] {
    return this.BADGE_DEFINITIONS.filter(badge => badge.category === category);
  }

  /**
   * Get badges by tier
   */
  static getBadgesByTier(tier: string): Omit<Badge, 'earned' | 'earnedDate'>[] {
    return this.BADGE_DEFINITIONS.filter(badge => badge.tier === tier);
  }

  /**
   * Get badges by rarity
   */
  static getBadgesByRarity(rarity: string): Omit<Badge, 'earned' | 'earnedDate'>[] {
    return this.BADGE_DEFINITIONS.filter(badge => badge.rarity === rarity);
  }
}

/**
 * Corporate Account Management
 */
export interface CorporateAccount {
  employeeId: string;
  department: string;
  manager: string;
  isActive: boolean;
  permissions: string[];
  lastActivity: string;
}

export class CorporateAccountManager {
  /**
   * Check if user can perform account actions
   */
  static canDeleteAccount(userRole: string): boolean {
    // Only IT administrators can delete accounts
    return userRole === 'IT_ADMIN' || userRole === 'SYSTEM_ADMIN';
  }

  /**
   * Check if user can modify account settings
   */
  static canModifyAccount(userRole: string, targetUserId: string, currentUserId: string): boolean {
    // Users can modify their own basic info, IT can modify anyone's
    return currentUserId === targetUserId || userRole === 'IT_ADMIN' || userRole === 'SYSTEM_ADMIN';
  }

  /**
   * Get account restrictions for user
   */
  static getAccountRestrictions(userRole: string): {
    canDeleteAccount: boolean;
    canChangeEmail: boolean;
    canExportData: boolean;
    canContactSupport: boolean;
  } {
    const isITAdmin = userRole === 'IT_ADMIN' || userRole === 'SYSTEM_ADMIN';
    
    return {
      canDeleteAccount: isITAdmin,
      canChangeEmail: isITAdmin,
      canExportData: true, // All users can export their own data
      canContactSupport: true, // All users can contact support
    };
  }
}