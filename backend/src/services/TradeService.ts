import { Trade, ITrade, Mood, TradeType } from '../models/Trade';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Trade input data structure
 */
export interface TradeInput {
  asset: string;
  entryPrice: number;
  exitPrice: number;
  tradeType: TradeType;
  mood: Mood;
  notes?: string;
}

/**
 * Trade filters for querying
 */
export interface TradeFilters {
  mood?: Mood;
  asset?: string;
  limit?: number;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Trade Service
 * Handles trade CRUD operations, profit/loss calculations, and validation
 */
export class TradeService {
  /**
   * Calculate profit/loss for a trade
   * @param entryPrice - Price at which trade was entered
   * @param exitPrice - Price at which trade was exited
   * @param tradeType - Type of trade (long or short)
   * @returns Calculated profit/loss
   */
  public calculateProfitLoss(
    entryPrice: number,
    exitPrice: number,
    tradeType: TradeType
  ): number {
    if (tradeType === TradeType.LONG) {
      // For long trades: profit when exit > entry
      return exitPrice - entryPrice;
    } else {
      // For short trades: profit when entry > exit
      return entryPrice - exitPrice;
    }
  }

  /**
   * Validate trade input data
   * @param tradeData - Trade input to validate
   * @returns Validation result with errors if any
   */
  public validateTradeInput(tradeData: TradeInput): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!tradeData.asset || tradeData.asset.trim() === '') {
      errors.push('Asset is required');
    }

    if (tradeData.entryPrice === undefined || tradeData.entryPrice === null) {
      errors.push('Entry price is required');
    } else if (tradeData.entryPrice <= 0) {
      errors.push('Entry price must be a positive number');
    }

    if (tradeData.exitPrice === undefined || tradeData.exitPrice === null) {
      errors.push('Exit price is required');
    } else if (tradeData.exitPrice <= 0) {
      errors.push('Exit price must be a positive number');
    }

    if (!tradeData.tradeType) {
      errors.push('Trade type is required');
    } else if (!Object.values(TradeType).includes(tradeData.tradeType)) {
      errors.push('Trade type must be either "long" or "short"');
    }

    if (!tradeData.mood) {
      errors.push('Mood is required');
    } else if (!Object.values(Mood).includes(tradeData.mood)) {
      errors.push('Mood must be one of: Calm, Anxious, Greedy, Disciplined, Fearful');
    }

    // Validate optional notes length
    if (tradeData.notes && tradeData.notes.length > 500) {
      errors.push('Notes cannot exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a new trade
   * @param userId - ID of the user creating the trade
   * @param tradeData - Trade input data
   * @returns Created trade document
   * @throws Error if validation fails or database operation fails
   */
  public async createTrade(
    userId: mongoose.Types.ObjectId,
    tradeData: TradeInput
  ): Promise<ITrade> {
    try {
      // Validate input
      const validation = this.validateTradeInput(tradeData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Calculate profit/loss
      const profitLoss = this.calculateProfitLoss(
        tradeData.entryPrice,
        tradeData.exitPrice,
        tradeData.tradeType
      );

      // Create trade document
      const trade = new Trade({
        userId,
        asset: tradeData.asset.trim(),
        entryPrice: tradeData.entryPrice,
        exitPrice: tradeData.exitPrice,
        tradeType: tradeData.tradeType,
        mood: tradeData.mood,
        notes: tradeData.notes?.trim(),
        profitLoss,
        timestamp: new Date(),
      });

      await trade.save();

      logger.info('Trade created successfully', {
        userId,
        tradeId: trade._id,
        asset: trade.asset,
        profitLoss,
      });

      return trade;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Create trade error:', { message: error.message, userId });
        throw error;
      }
      throw new Error('Failed to create trade');
    }
  }

  /**
   * Get trades for a user with optional filters
   * @param userId - ID of the user
   * @param filters - Optional filters (mood, asset, limit)
   * @returns Array of trade documents
   */
  public async getTrades(
    userId: mongoose.Types.ObjectId,
    filters?: TradeFilters
  ): Promise<ITrade[]> {
    try {
      // Build query
      const query: any = { userId };

      if (filters?.mood) {
        query.mood = filters.mood;
      }

      if (filters?.asset) {
        query.asset = filters.asset;
      }

      // Set limit (default 10)
      const limit = filters?.limit || 10;

      // Execute query
      const trades = await Trade.find(query)
        .sort({ timestamp: -1 }) // Most recent first
        .limit(limit)
        .exec();

      logger.debug('Trades retrieved', { userId, count: trades.length, filters });

      return trades;
    } catch (error) {
      logger.error('Get trades error:', { userId, error });
      throw new Error('Failed to retrieve trades');
    }
  }

  /**
   * Get a single trade by ID
   * @param userId - ID of the user
   * @param tradeId - ID of the trade
   * @returns Trade document or null if not found
   */
  public async getTradeById(
    userId: mongoose.Types.ObjectId,
    tradeId: string
  ): Promise<ITrade | null> {
    try {
      const trade = await Trade.findOne({
        _id: tradeId,
        userId, // Ensure user owns the trade
      });

      return trade;
    } catch (error) {
      logger.error('Get trade by ID error:', { userId, tradeId, error });
      return null;
    }
  }
}

export const tradeService = new TradeService();
