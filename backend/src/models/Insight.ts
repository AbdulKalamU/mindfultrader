import mongoose, { Document, Schema } from 'mongoose';
import { Mood } from './Trade';

/**
 * Mood correlation interface representing statistical analysis per mood
 */
export interface IMoodCorrelation {
  mood: Mood;
  totalProfitLoss: number;
  averageProfitLoss: number;
  tradeCount: number;
  rank: number; // 1 = best performing, 5 = worst performing
}

/**
 * Insight interface representing the Insight document structure
 */
export interface IInsight extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  moodAnalysis: IMoodCorrelation[];
  generatedAt: Date;
  // Optional new fields (backward compatible)
  warnings?: string[];
  recommendations?: string[];
  analytics?: {
    winRateByAsset?: { asset: string; winRate: number; tradeCount: number }[];
    avgProfit?: number;
    avgLoss?: number;
    currentStreak?: { type: string; count: number };
    longestWinStreak?: number;
    longestLossStreak?: number;
  };
}

/**
 * Mood correlation sub-schema
 */
const moodCorrelationSchema = new Schema<IMoodCorrelation>(
  {
    mood: {
      type: String,
      required: true,
      enum: Object.values(Mood),
    },
    totalProfitLoss: {
      type: Number,
      required: true,
    },
    averageProfitLoss: {
      type: Number,
      required: true,
    },
    tradeCount: {
      type: Number,
      required: true,
      min: 0,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { _id: false } // Don't create _id for sub-documents
);

/**
 * Insight schema definition
 * Stores AI-generated insights about mood-performance correlations
 */
const insightSchema = new Schema<IInsight>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // Index for fast user-specific queries
    },
    text: {
      type: String,
      required: [true, 'Insight text is required'],
    },
    moodAnalysis: {
      type: [moodCorrelationSchema],
      required: true,
      validate: {
        validator: function (analysis: IMoodCorrelation[]) {
          // Ensure we have at least one mood analysis
          return analysis.length > 0;
        },
        message: 'Mood analysis must contain at least one entry',
      },
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Optional new fields (backward compatible - existing insights won't break)
    warnings: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    analytics: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: false, // We use generatedAt instead
  }
);

// Index for retrieving latest insights for a user
insightSchema.index({ userId: 1, generatedAt: -1 });

export const Insight = mongoose.model<IInsight>('Insight', insightSchema);
