import { Router, Request, Response } from 'express';
import { insightsEngine } from '../services/InsightsEngine';
import { Trade } from '../models/Trade';
import { requireAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// All insights routes require authentication
router.use(requireAuth);

/**
 * GET /api/insights
 * Get AI-generated insights for the authenticated user
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get trade count
    const tradeCount = await Trade.countDocuments({ userId });

    // Check if user has minimum trades for insights
    const hasMinimumData = insightsEngine.shouldGenerateInsights(tradeCount);

    if (!hasMinimumData) {
      res.status(200).json({
        insights: [],
        tradeCount,
        hasMinimumData: false,
        message: 'You need at least 10 trades to generate insights',
      });
      return;
    }

    // Generate or retrieve insights
    const insight = await insightsEngine.generateInsights(userId);

    if (!insight) {
      res.status(200).json({
        insights: [],
        tradeCount,
        hasMinimumData: false,
        message: 'Unable to generate insights at this time',
      });
      return;
    }

    res.status(200).json({
      insights: [
        {
          id: insight._id,
          text: insight.text,
          moodAnalysis: insight.moodAnalysis.map((analysis) => ({
            mood: analysis.mood,
            totalProfitLoss: analysis.totalProfitLoss,
            averageProfitLoss: analysis.averageProfitLoss,
            tradeCount: analysis.tradeCount,
            rank: analysis.rank,
          })),
          generatedAt: insight.generatedAt,
          // New fields (backward compatible - will be undefined for old insights)
          warnings: insight.warnings || [],
          recommendations: insight.recommendations || [],
          analytics: insight.analytics || {},
        },
      ],
      tradeCount,
      hasMinimumData: true,
    });
  } catch (error) {
    logger.error('Get insights endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving insights. Please try again.',
    });
  }
});

export default router;
