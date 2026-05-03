import { Router, Request, Response } from 'express';
import { Wallet, TransactionType } from '../models/Wallet';
import { requireAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// All wallet routes require authentication
router.use(requireAuth);

/**
 * GET /api/wallet
 * Get user's wallet information
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    let wallet = await Wallet.findOne({ userId });

    // Create wallet if it doesn't exist (backward compatible)
    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: 0,
        currency: 'USD',
        transactions: [],
      });
      await wallet.save();
      logger.info('Wallet created for user', { userId });
    }

    res.status(200).json({
      wallet: {
        id: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
        transactions: wallet.transactions.slice(-20), // Return last 20 transactions
        transactionCount: wallet.transactions.length,
      },
    });
  } catch (error) {
    logger.error('Get wallet endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving wallet. Please try again.',
    });
  }
});

/**
 * GET /api/wallet/analytics
 * Get portfolio analytics including equity curve and performance metrics
 */
router.get('/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Import Trade model here to avoid circular dependency
    const { Trade } = require('../models/Trade');

    const wallet = await Wallet.findOne({ userId });
    const trades = await Trade.find({ userId }).sort({ timestamp: 1 }).exec();

    // Calculate total P/L from trades
    const totalPL = trades.reduce((sum: number, trade: any) => {
      const pl = Number(trade.profitLoss);
      return sum + (isNaN(pl) ? 0 : pl);
    }, 0);

    // Find best and worst trades
    const validTrades = trades.filter((t: any) => !isNaN(Number(t.profitLoss)));
    const bestTrade = validTrades.length > 0
      ? validTrades.reduce((best: any, trade: any) => Number(trade.profitLoss) > Number(best.profitLoss) ? trade : best)
      : null;
    const worstTrade = validTrades.length > 0
      ? validTrades.reduce((worst: any, trade: any) => Number(trade.profitLoss) < Number(worst.profitLoss) ? trade : worst)
      : null;

    // Calculate equity curve (balance over time)
    const equityCurve: { date: string; balance: number }[] = [];

    // Start with initial balance
    if (wallet && wallet.transactions.length > 0) {
      const firstTransaction = wallet.transactions[0];
      equityCurve.push({
        date: new Date(firstTransaction.date).toISOString(),
        balance: 0,
      });
    }

    // Add wallet transactions to equity curve
    if (wallet) {
      let cumulativeBalance = 0;
      for (const transaction of wallet.transactions) {
        if (transaction.type === 'deposit') {
          cumulativeBalance += transaction.amount;
        } else if (transaction.type === 'withdraw') {
          cumulativeBalance -= transaction.amount;
        }
        equityCurve.push({
          date: new Date(transaction.date).toISOString(),
          balance: cumulativeBalance,
        });
      }
    }

    // Add trade P/L to equity curve
    let tradeBalance = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].balance : 0;
    for (const trade of trades) {
      const pl = Number(trade.profitLoss);
      if (!isNaN(pl)) {
        tradeBalance += pl;
        equityCurve.push({
          date: new Date(trade.timestamp).toISOString(),
          balance: tradeBalance,
        });
      }
    }

    res.status(200).json({
      analytics: {
        totalPL: Math.round(totalPL * 100) / 100,
        currentBalance: wallet?.balance || 0,
        bestTrade: bestTrade ? {
          asset: bestTrade.asset,
          profitLoss: Number(bestTrade.profitLoss),
          date: bestTrade.timestamp,
          mood: bestTrade.mood,
        } : null,
        worstTrade: worstTrade ? {
          asset: worstTrade.asset,
          profitLoss: Number(worstTrade.profitLoss),
          date: worstTrade.timestamp,
          mood: worstTrade.mood,
        } : null,
        equityCurve: equityCurve.slice(-50), // Last 50 data points
        tradeCount: trades.length,
      },
    });
  } catch (error) {
    logger.error('Wallet analytics endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving analytics. Please try again.',
    });
  }
});

/**
 * POST /api/wallet/deposit
 * Mock deposit to wallet
 */
router.post('/deposit', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { amount, description } = req.body;

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Amount must be a positive number',
      });
      return;
    }

    let wallet = await Wallet.findOne({ userId });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: 0,
        currency: 'USD',
        transactions: [],
      });
    }

    // Add transaction
    wallet.transactions.push({
      type: TransactionType.DEPOSIT,
      amount: parsedAmount,
      date: new Date(),
      description: description || 'Mock deposit',
    });

    // Update balance
    wallet.balance += parsedAmount;

    await wallet.save();

    logger.info('Deposit successful', { userId, amount: parsedAmount });

    res.status(200).json({
      wallet: {
        id: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
      },
      transaction: wallet.transactions[wallet.transactions.length - 1],
      message: 'Deposit successful',
    });
  } catch (error) {
    logger.error('Deposit endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while processing deposit. Please try again.',
    });
  }
});

/**
 * POST /api/wallet/withdraw
 * Mock withdrawal from wallet
 */
router.post('/withdraw', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { amount, description } = req.body;

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Amount must be a positive number',
      });
      return;
    }

    let wallet = await Wallet.findOne({ userId });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: 0,
        currency: 'USD',
        transactions: [],
      });
      await wallet.save();
    }

    // Check sufficient balance
    if (wallet.balance < parsedAmount) {
      res.status(400).json({
        error: 'Insufficient Funds',
        message: 'Insufficient balance for withdrawal',
      });
      return;
    }

    // Add transaction
    wallet.transactions.push({
      type: TransactionType.WITHDRAW,
      amount: parsedAmount,
      date: new Date(),
      description: description || 'Mock withdrawal',
    });

    // Update balance
    wallet.balance -= parsedAmount;

    await wallet.save();

    logger.info('Withdrawal successful', { userId, amount: parsedAmount });

    res.status(200).json({
      wallet: {
        id: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
      },
      transaction: wallet.transactions[wallet.transactions.length - 1],
      message: 'Withdrawal successful',
    });
  } catch (error) {
    logger.error('Withdraw endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while processing withdrawal. Please try again.',
    });
  }
});

export default router;
