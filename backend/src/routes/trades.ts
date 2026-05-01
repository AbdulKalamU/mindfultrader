import { Router, Request, Response } from 'express';
import { tradeService } from '../services/TradeService';
import { insightsEngine } from '../services/InsightsEngine';
import { requireAuth } from '../middleware/auth';
import { logger } from '../utils/logger';
import { Mood, TradeType } from '../models/Trade';

const router = Router();

// All trade routes require authentication
router.use(requireAuth);

/**
 * POST /api/trades
 * Create a new trade
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { asset, entryPrice, exitPrice, tradeType, mood, notes } = req.body;
    const userId = req.userId!;

    // Parse and validate prices
    const parsedEntryPrice = parseFloat(entryPrice);
    const parsedExitPrice = parseFloat(exitPrice);

    if (isNaN(parsedEntryPrice) || !isFinite(parsedEntryPrice)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Entry price must be a valid number',
      });
    }

    if (isNaN(parsedExitPrice) || !isFinite(parsedExitPrice)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Exit price must be a valid number',
      });
    }

    // Create trade
    const trade = await tradeService.createTrade(userId, {
      asset,
      entryPrice: parsedEntryPrice,
      exitPrice: parsedExitPrice,
      tradeType: tradeType as TradeType,
      mood: mood as Mood,
      notes,
    });

    // Trigger insights generation asynchronously (don't wait for it)
    insightsEngine.generateInsights(userId).catch((error) => {
      logger.error('Background insights generation failed:', { userId, error });
    });

    res.status(201).json({
      trade: {
        id: trade._id,
        asset: trade.asset,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        tradeType: trade.tradeType,
        mood: trade.mood,
        notes: trade.notes,
        profitLoss: trade.profitLoss,
        timestamp: trade.timestamp,
      },
      message: 'Trade created successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
      });
    }

    logger.error('Create trade endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while creating the trade. Please try again.',
    });
  }
});

/**
 * GET /api/trades
 * Get user's trades with optional filters
 * Query params: mood, asset, limit
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { mood, asset, limit } = req.query;

    // Build filters
    const filters: any = {};

    if (mood && typeof mood === 'string') {
      filters.mood = mood as Mood;
    }

    if (asset && typeof asset === 'string') {
      filters.asset = asset;
    }

    if (limit && typeof limit === 'string') {
      const parsedLimit = parseInt(limit);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        filters.limit = parsedLimit;
      }
    }

    // Get trades
    const trades = await tradeService.getTrades(userId, filters);

    res.status(200).json({
      trades: trades.map((trade) => ({
        id: trade._id,
        asset: trade.asset,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        tradeType: trade.tradeType,
        mood: trade.mood,
        notes: trade.notes,
        profitLoss: trade.profitLoss,
        timestamp: trade.timestamp,
      })),
      count: trades.length,
    });
  } catch (error) {
    logger.error('Get trades endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving trades. Please try again.',
    });
  }
});

export default router;
