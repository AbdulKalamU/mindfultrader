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
router.get('/', async (req: Request, res: Response) => {
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
 * POST /api/wallet/deposit
 * Mock deposit to wallet
 */
router.post('/deposit', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { amount, description } = req.body;

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Amount must be a positive number',
      });
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
router.post('/withdraw', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { amount, description } = req.body;

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Amount must be a positive number',
      });
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
      return res.status(400).json({
        error: 'Insufficient Funds',
        message: 'Insufficient balance for withdrawal',
      });
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
