import { Trade, ITrade, Mood } from '../models/Trade';
import { Insight, IInsight, IMoodCorrelation } from '../models/Insight';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Pattern interface representing identified trading patterns
 */
export interface Pattern {
  type: 'best' | 'worst';
  mood: Mood;
  averageProfitLoss: number;
  tradeCount: number;
}

/**
 * Advanced analytics interface
 */
export interface AdvancedAnalytics {
  winRateByAsset: { asset: string; winRate: number; tradeCount: number }[];
  avgProfit: number;
  avgLoss: number;
  currentStreak: { type: 'win' | 'loss'; count: number };
  longestWinStreak: number;
  longestLossStreak: number;
  moodPerformance: { mood: Mood; winRate: number; avgPL: number }[];
}

/**
 * Alert interface
 */
export interface Alert {
  type: 'warning' | 'info' | 'danger';
  message: string;
  timestamp: Date;
}

/**
 * Recommendation interface
 */
export interface Recommendation {
  message: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * AI Insights Engine
 * Analyzes trade history to identify mood-performance correlations and generate insights
 */
export class InsightsEngine {
  private static readonly MINIMUM_TRADES = 10;

  /**
   * Check if user has sufficient data for insights generation
   * @param tradeCount - Number of trades
   * @returns True if sufficient data exists
   */
  public shouldGenerateInsights(tradeCount: number): boolean {
    return tradeCount >= InsightsEngine.MINIMUM_TRADES;
  }

  /**
   * Analyze mood-to-profitability correlations
   * @param trades - Array of trade documents
   * @returns Array of mood correlations with statistics
   */
  public analyzeMoodCorrelation(trades: ITrade[]): IMoodCorrelation[] {
    // Group trades by mood
    const moodGroups: Map<Mood, ITrade[]> = new Map();

    for (const trade of trades) {
      if (!moodGroups.has(trade.mood)) {
        moodGroups.set(trade.mood, []);
      }
      moodGroups.get(trade.mood)!.push(trade);
    }

    // Calculate statistics for each mood
    const correlations: IMoodCorrelation[] = [];

    for (const [mood, moodTrades] of moodGroups.entries()) {
      // Filter out trades with invalid profitLoss values and convert to numbers
      const validTrades = moodTrades.filter(trade => {
        const pl = Number(trade.profitLoss);
        return !isNaN(pl) && isFinite(pl);
      });

      // Skip this mood if no valid trades
      if (validTrades.length === 0) {
        logger.warn('No valid trades for mood', { mood, totalTrades: moodTrades.length });
        continue;
      }

      const totalProfitLoss = validTrades.reduce((sum, trade) => {
        const pl = Number(trade.profitLoss);
        return sum + pl;
      }, 0);
      
      const averageProfitLoss = totalProfitLoss / validTrades.length;
      const tradeCount = validTrades.length;

      // Ensure values are valid numbers before adding to correlations
      if (isNaN(totalProfitLoss) || isNaN(averageProfitLoss) || !isFinite(totalProfitLoss) || !isFinite(averageProfitLoss)) {
        logger.error('Invalid calculation for mood', { 
          mood, 
          totalProfitLoss, 
          averageProfitLoss, 
          tradeCount,
          sampleProfitLoss: validTrades.slice(0, 3).map(t => t.profitLoss)
        });
        continue;
      }

      correlations.push({
        mood,
        totalProfitLoss,
        averageProfitLoss,
        tradeCount,
        rank: 0, // Will be set after sorting
      });
    }

    // Sort by average profit/loss (descending) and assign ranks
    correlations.sort((a, b) => b.averageProfitLoss - a.averageProfitLoss);
    correlations.forEach((correlation, index) => {
      correlation.rank = index + 1;
    });

    return correlations;
  }

  /**
   * Identify key patterns from mood correlations
   * @param trades - Array of trade documents
   * @returns Array of identified patterns
   */
  public identifyPatterns(trades: ITrade[]): Pattern[] {
    const correlations = this.analyzeMoodCorrelation(trades);

    if (correlations.length === 0) {
      return [];
    }

    const patterns: Pattern[] = [];

    // Best performing mood (rank 1)
    const best = correlations[0];
    patterns.push({
      type: 'best',
      mood: best.mood,
      averageProfitLoss: best.averageProfitLoss,
      tradeCount: best.tradeCount,
    });

    // Worst performing mood (last rank)
    const worst = correlations[correlations.length - 1];
    patterns.push({
      type: 'worst',
      mood: worst.mood,
      averageProfitLoss: worst.averageProfitLoss,
      tradeCount: worst.tradeCount,
    });

    return patterns;
  }

  /**
   * Generate natural language insight text from mood correlation
   * @param correlation - Mood correlation data
   * @returns Natural language insight string
   */
  public formatInsightText(correlation: IMoodCorrelation): string {
    const { mood, averageProfitLoss, tradeCount, rank } = correlation;

    const profitLossText =
      averageProfitLoss >= 0
        ? `average profit of ${averageProfitLoss.toFixed(2)}`
        : `average loss of ${Math.abs(averageProfitLoss).toFixed(2)}`;

    if (rank === 1) {
      return `Your highest success rate is when you are ${mood}. You have an ${profitLossText} across ${tradeCount} trades in this mood state.`;
    } else if (rank === 5 || averageProfitLoss < 0) {
      return `You tend to lose more trades when feeling ${mood}. You have an ${profitLossText} across ${tradeCount} trades in this mood state.`;
    } else {
      return `When trading while ${mood}, you have an ${profitLossText} across ${tradeCount} trades.`;
    }
  }

  /**
   * Calculate win rate by asset
   * @param trades - Array of trade documents
   * @returns Array of asset win rates
   */
  public calculateWinRateByAsset(trades: ITrade[]): { asset: string; winRate: number; tradeCount: number }[] {
    const assetGroups = new Map<string, ITrade[]>();

    for (const trade of trades) {
      if (!assetGroups.has(trade.asset)) {
        assetGroups.set(trade.asset, []);
      }
      assetGroups.get(trade.asset)!.push(trade);
    }

    const results: { asset: string; winRate: number; tradeCount: number }[] = [];

    for (const [asset, assetTrades] of assetGroups.entries()) {
      const validTrades = assetTrades.filter(t => !isNaN(Number(t.profitLoss)) && isFinite(Number(t.profitLoss)));
      const winningTrades = validTrades.filter(t => Number(t.profitLoss) > 0);
      const winRate = validTrades.length > 0 ? (winningTrades.length / validTrades.length) * 100 : 0;

      results.push({
        asset,
        winRate: Math.round(winRate * 100) / 100,
        tradeCount: validTrades.length,
      });
    }

    return results.sort((a, b) => b.winRate - a.winRate);
  }

  /**
   * Calculate average profit and loss separately
   * @param trades - Array of trade documents
   * @returns Object with avgProfit and avgLoss
   */
  public calculateAvgProfitLoss(trades: ITrade[]): { avgProfit: number; avgLoss: number } {
    const validTrades = trades.filter(t => !isNaN(Number(t.profitLoss)) && isFinite(Number(t.profitLoss)));
    const profitableTrades = validTrades.filter(t => Number(t.profitLoss) > 0);
    const losingTrades = validTrades.filter(t => Number(t.profitLoss) < 0);

    const avgProfit = profitableTrades.length > 0
      ? profitableTrades.reduce((sum, t) => sum + Number(t.profitLoss), 0) / profitableTrades.length
      : 0;

    const avgLoss = losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + Number(t.profitLoss), 0) / losingTrades.length
      : 0;

    return { avgProfit, avgLoss };
  }

  /**
   * Detect win/loss streaks
   * @param trades - Array of trade documents (sorted by timestamp)
   * @returns Streak information
   */
  public detectStreaks(trades: ITrade[]): { current: { type: 'win' | 'loss'; count: number }; longestWin: number; longestLoss: number } {
    const validTrades = trades
      .filter(t => !isNaN(Number(t.profitLoss)) && isFinite(Number(t.profitLoss)))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (validTrades.length === 0) {
      return { current: { type: 'win', count: 0 }, longestWin: 0, longestLoss: 0 };
    }

    let currentStreak = 0;
    let currentType: 'win' | 'loss' = Number(validTrades[0].profitLoss) > 0 ? 'win' : 'loss';
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;

    for (const trade of validTrades) {
      const isWin = Number(trade.profitLoss) > 0;

      if (isWin) {
        tempWinStreak++;
        tempLossStreak = 0;
        if (tempWinStreak > longestWinStreak) longestWinStreak = tempWinStreak;
      } else {
        tempLossStreak++;
        tempWinStreak = 0;
        if (tempLossStreak > longestLossStreak) longestLossStreak = tempLossStreak;
      }
    }

    // Calculate current streak
    currentType = Number(validTrades[0].profitLoss) > 0 ? 'win' : 'loss';
    for (const trade of validTrades) {
      const isWin = Number(trade.profitLoss) > 0;
      if ((currentType === 'win' && isWin) || (currentType === 'loss' && !isWin)) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      current: { type: currentType, count: currentStreak },
      longestWin: longestWinStreak,
      longestLoss: longestLossStreak,
    };
  }

  /**
   * Calculate mood-based performance metrics
   * @param trades - Array of trade documents
   * @returns Array of mood performance metrics
   */
  public calculateMoodPerformance(trades: ITrade[]): { mood: Mood; winRate: number; avgPL: number }[] {
    const moodGroups = new Map<Mood, ITrade[]>();

    for (const trade of trades) {
      if (!moodGroups.has(trade.mood)) {
        moodGroups.set(trade.mood, []);
      }
      moodGroups.get(trade.mood)!.push(trade);
    }

    const results: { mood: Mood; winRate: number; avgPL: number }[] = [];

    for (const [mood, moodTrades] of moodGroups.entries()) {
      const validTrades = moodTrades.filter(t => !isNaN(Number(t.profitLoss)) && isFinite(Number(t.profitLoss)));
      const winningTrades = validTrades.filter(t => Number(t.profitLoss) > 0);
      const winRate = validTrades.length > 0 ? (winningTrades.length / validTrades.length) * 100 : 0;
      const avgPL = validTrades.length > 0
        ? validTrades.reduce((sum, t) => sum + Number(t.profitLoss), 0) / validTrades.length
        : 0;

      results.push({ mood, winRate: Math.round(winRate * 100) / 100, avgPL });
    }

    return results.sort((a, b) => b.avgPL - a.avgPL);
  }

  /**
   * Generate alerts based on trading patterns
   * @param trades - Array of trade documents
   * @returns Array of alerts
   */
  public generateAlerts(trades: ITrade[]): Alert[] {
    const alerts: Alert[] = [];
    const validTrades = trades.filter(t => !isNaN(Number(t.profitLoss)) && isFinite(Number(t.profitLoss)));

    if (validTrades.length < 3) return alerts;

    // Check for losing streak (3 losses in a row)
    const recentTrades = validTrades.slice(0, 3);
    const consecutiveLosses = recentTrades.every(t => Number(t.profitLoss) < 0);
    if (consecutiveLosses) {
      alerts.push({
        type: 'danger',
        message: 'You are on a losing streak (3 losses in a row). Take a break and review your strategy.',
        timestamp: new Date(),
      });
    }

    // Check for overtrading (>5 trades per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTrades = validTrades.filter(t => {
      const tradeDate = new Date(t.timestamp);
      tradeDate.setHours(0, 0, 0, 0);
      return tradeDate.getTime() === today.getTime();
    });
    if (todayTrades.length > 5) {
      alerts.push({
        type: 'warning',
        message: `Overtrading detected: ${todayTrades.length} trades today. Slow down and focus on quality.`,
        timestamp: new Date(),
      });
    }

    // Check mood-based performance
    const moodPerf = this.calculateMoodPerformance(validTrades);
    const greedyPerf = moodPerf.find(m => m.mood === Mood.GREEDY);
    const anxiousPerf = moodPerf.find(m => m.mood === Mood.ANXIOUS);
    
    if (greedyPerf && greedyPerf.avgPL < 0) {
      alerts.push({
        type: 'warning',
        message: 'You perform worse when greedy. Stay disciplined and stick to your plan.',
        timestamp: new Date(),
      });
    }
    
    if (anxiousPerf && anxiousPerf.avgPL < 0) {
      alerts.push({
        type: 'warning',
        message: 'You perform worse when anxious. Consider taking a break when feeling stressed.',
        timestamp: new Date(),
      });
    }

    // Check for revenge trading (multiple losses in short time)
    const recentFive = validTrades.slice(0, 5);
    const recentLosses = recentFive.filter(t => Number(t.profitLoss) < 0);
    if (recentLosses.length >= 4) {
      alerts.push({
        type: 'danger',
        message: 'Revenge trading detected: 4+ losses in your last 5 trades. Stop and reassess.',
        timestamp: new Date(),
      });
    }

    // Check for emotional bias (greedy/anxious patterns)
    const emotionalTrades = validTrades.filter(t => t.mood === Mood.GREEDY || t.mood === Mood.ANXIOUS);
    const emotionalLosses = emotionalTrades.filter(t => Number(t.profitLoss) < 0);
    if (emotionalTrades.length >= 5 && emotionalLosses.length / emotionalTrades.length > 0.7) {
      alerts.push({
        type: 'warning',
        message: 'Emotional bias detected: Most of your emotional trades are losses. Trade with a clear mind.',
        timestamp: new Date(),
      });
    }

    return alerts;
  }

  /**
   * Generate recommendations based on trading patterns
   * @param trades - Array of trade documents
   * @returns Array of recommendations
   */
  public generateRecommendations(trades: ITrade[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const validTrades = trades.filter(t => !isNaN(Number(t.profitLoss)) && isFinite(Number(t.profitLoss)));

    if (validTrades.length < 10) return recommendations;

    // Analyze mood performance
    const moodPerf = this.calculateMoodPerformance(validTrades);
    const bestMood = moodPerf[0];
    const worstMood = moodPerf[moodPerf.length - 1];

    if (bestMood && bestMood.avgPL > 0) {
      recommendations.push({
        message: `Your best performance is when ${bestMood.mood}. Try to trade more in this mental state.`,
        priority: 'high',
      });
    }

    if (worstMood && worstMood.avgPL < 0) {
      recommendations.push({
        message: `Avoid trading when ${worstMood.mood}. This mood leads to consistent losses.`,
        priority: 'high',
      });
    }

    // Analyze asset performance
    const assetPerf = this.calculateWinRateByAsset(validTrades);
    const bestAsset = assetPerf[0];
    const worstAsset = assetPerf[assetPerf.length - 1];

    if (bestAsset && bestAsset.winRate > 60) {
      recommendations.push({
        message: `${bestAsset.asset} is your strongest asset with ${bestAsset.winRate}% win rate. Consider focusing here.`,
        priority: 'medium',
      });
    }

    if (worstAsset && worstAsset.winRate < 40 && worstAsset.tradeCount >= 5) {
      recommendations.push({
        message: `${worstAsset.asset} has a low win rate (${worstAsset.winRate}%). Consider avoiding or studying this asset more.`,
        priority: 'medium',
      });
    }

    // Analyze profit/loss ratio
    const { avgProfit, avgLoss } = this.calculateAvgProfitLoss(validTrades);
    const profitLossRatio = avgProfit / Math.abs(avgLoss);

    if (profitLossRatio < 1) {
      recommendations.push({
        message: 'Your average loss exceeds your average profit. Focus on better risk management and stop-loss placement.',
        priority: 'high',
      });
    }

    return recommendations;
  }

  /**
   * Generate comprehensive insights for a user
   * @param userId - ID of the user
   * @returns Generated insight document or null if insufficient data
   */
  public async generateInsights(userId: mongoose.Types.ObjectId): Promise<IInsight | null> {
    try {
      // Fetch all user's trades
      const trades = await Trade.find({ userId }).sort({ timestamp: -1 }).exec();

      // Check if sufficient data exists
      if (!this.shouldGenerateInsights(trades.length)) {
        logger.debug('Insufficient trades for insights', { userId, tradeCount: trades.length });
        return null;
      }

      // Analyze mood correlations
      const moodAnalysis = this.analyzeMoodCorrelation(trades);

      // Check if we have valid mood analysis data
      if (moodAnalysis.length === 0) {
        logger.warn('No valid mood analysis data', { userId, tradeCount: trades.length });
        return null;
      }

      // Identify patterns
      const patterns = this.identifyPatterns(trades);

      // Generate insight text
      const insightTexts: string[] = [];

      // Add best and worst mood insights
      for (const pattern of patterns) {
        const correlation = moodAnalysis.find((c) => c.mood === pattern.mood);
        if (correlation) {
          insightTexts.push(this.formatInsightText(correlation));
        }
      }

      // Add additional insights for other moods with significant data
      for (const correlation of moodAnalysis) {
        if (
          correlation.rank !== 1 &&
          correlation.rank !== moodAnalysis.length &&
          correlation.tradeCount >= 3
        ) {
          insightTexts.push(this.formatInsightText(correlation));
        }
      }

      const insightText = insightTexts.join(' ');

      // Generate advanced analytics
      const winRateByAsset = this.calculateWinRateByAsset(trades);
      const { avgProfit, avgLoss } = this.calculateAvgProfitLoss(trades);
      const streaks = this.detectStreaks(trades);
      const alerts = this.generateAlerts(trades);
      const recommendations = this.generateRecommendations(trades);

      // Delete previous insights for this user (keep only latest)
      await Insight.deleteMany({ userId });

      // Create new insight document with enhanced data
      const insight = new Insight({
        userId,
        text: insightText,
        moodAnalysis,
        generatedAt: new Date(),
        warnings: alerts.map(a => a.message),
        recommendations: recommendations.map(r => r.message),
        analytics: {
          winRateByAsset,
          avgProfit,
          avgLoss,
          currentStreak: streaks.current,
          longestWinStreak: streaks.longestWin,
          longestLossStreak: streaks.longestLoss,
        },
      });

      await insight.save();

      logger.info('Insights generated successfully', {
        userId,
        insightId: insight._id,
        tradeCount: trades.length,
        alertCount: alerts.length,
        recommendationCount: recommendations.length,
      });

      return insight;
    } catch (error) {
      logger.error('Generate insights error:', { userId, error });
      throw new Error('Failed to generate insights');
    }
  }
}

export const insightsEngine = new InsightsEngine();
