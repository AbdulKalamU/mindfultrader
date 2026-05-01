import { Router, Request, Response } from 'express';
import { User, TradingStyle, ExperienceLevel, RiskLevel } from '../models/User';
import { requireAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// All profile routes require authentication
router.use(requireAuth);

/**
 * GET /api/user/profile
 * Get user profile information
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      profile: {
        id: user._id,
        email: user.email,
        username: user.username || null,
        tradingStyle: user.tradingStyle || null,
        experienceLevel: user.experienceLevel || null,
        riskLevel: user.riskLevel || null,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Get profile endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving profile. Please try again.',
    });
  }
});

/**
 * PUT /api/user/profile
 * Update user profile information
 */
router.put('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { username, tradingStyle, experienceLevel, riskLevel } = req.body;

    // Validate enums if provided
    if (tradingStyle && !Object.values(TradingStyle).includes(tradingStyle)) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid trading style',
      });
      return;
    }

    if (experienceLevel && !Object.values(ExperienceLevel).includes(experienceLevel)) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid experience level',
      });
      return;
    }

    if (riskLevel && !Object.values(RiskLevel).includes(riskLevel)) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid risk level',
      });
      return;
    }

    // Build update object (only include provided fields)
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (tradingStyle !== undefined) updateData.tradingStyle = tradingStyle;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (riskLevel !== undefined) updateData.riskLevel = riskLevel;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    logger.info('Profile updated successfully', { userId });

    res.status(200).json({
      profile: {
        id: user._id,
        email: user.email,
        username: user.username || null,
        tradingStyle: user.tradingStyle || null,
        experienceLevel: user.experienceLevel || null,
        riskLevel: user.riskLevel || null,
        createdAt: user.createdAt,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.message,
      });
      return;
    }

    logger.error('Update profile endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while updating profile. Please try again.',
    });
  }
});

export default router;
