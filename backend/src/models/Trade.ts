import mongoose, { Document, Schema } from 'mongoose';

/**
 * Mood enum representing the five allowed emotional states
 */
export enum Mood {
  CALM = 'Calm',
  ANXIOUS = 'Anxious',
  GREEDY = 'Greedy',
  DISCIPLINED = 'Disciplined',
  FEARFUL = 'Fearful',
}

/**
 * Trade type enum representing trade direction
 */
export enum TradeType {
  LONG = 'long',
  SHORT = 'short',
}

/**
 * Trade interface representing the Trade document structure
 */
export interface ITrade extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  asset: string;
  entryPrice: number;
  exitPrice: number;
  tradeType: TradeType;
  mood: Mood;
  notes?: string;
  profitLoss: number;
  timestamp: Date;
  createdAt: Date;
  // Optional new fields (backward compatible)
  tags?: string[];
  rating?: number;
}

/**
 * Trade schema definition
 * Stores trade data with emotional context and financial details
 */
const tradeSchema = new Schema<ITrade>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      // Index removed - using compound indexes below instead
    },
    asset: {
      type: String,
      required: [true, 'Asset is required'],
      trim: true,
    },
    entryPrice: {
      type: Number,
      required: [true, 'Entry price is required'],
      min: [0.000001, 'Entry price must be positive'],
      validate: {
        validator: function (value: number) {
          return value > 0;
        },
        message: 'Entry price must be a positive number',
      },
    },
    exitPrice: {
      type: Number,
      required: [true, 'Exit price is required'],
      min: [0.000001, 'Exit price must be positive'],
      validate: {
        validator: function (value: number) {
          return value > 0;
        },
        message: 'Exit price must be a positive number',
      },
    },
    tradeType: {
      type: String,
      required: [true, 'Trade type is required'],
      enum: {
        values: Object.values(TradeType),
        message: 'Trade type must be either "long" or "short"',
      },
    },
    mood: {
      type: String,
      required: [true, 'Mood is required'],
      enum: {
        values: Object.values(Mood),
        message: 'Mood must be one of: Calm, Anxious, Greedy, Disciplined, Fearful',
      },
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      trim: true,
    },
    profitLoss: {
      type: Number,
      required: [true, 'Profit/Loss is required'],
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now,
      index: true, // Index for time-series queries
    },
    // Optional new fields (backward compatible - existing trades won't break)
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10; // Max 10 tags
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation time
  }
);

// Compound index for efficient filtering by user and timestamp
tradeSchema.index({ userId: 1, timestamp: -1 });

// Compound index for filtering by user and mood
tradeSchema.index({ userId: 1, mood: 1 });

// Compound index for filtering by user and asset
tradeSchema.index({ userId: 1, asset: 1 });

export const Trade = mongoose.model<ITrade>('Trade', tradeSchema);
