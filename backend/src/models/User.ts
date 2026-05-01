import mongoose, { Document, Schema } from 'mongoose';

/**
 * Trading style enum
 */
export enum TradingStyle {
  DAY_TRADER = 'Day Trader',
  SWING_TRADER = 'Swing Trader',
  SCALPER = 'Scalper',
  POSITION_TRADER = 'Position Trader',
  OTHER = 'Other',
}

/**
 * Experience level enum
 */
export enum ExperienceLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert',
}

/**
 * Risk level enum
 */
export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  VERY_HIGH = 'Very High',
}

/**
 * User interface representing the User document structure
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  // Optional profile fields (backward compatible)
  username?: string;
  tradingStyle?: TradingStyle;
  experienceLevel?: ExperienceLevel;
  riskLevel?: RiskLevel;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User schema definition
 * Stores user authentication data with email uniqueness constraint
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email: string) {
          // Email format validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Invalid email format',
      },
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      minlength: [60, 'Password hash must be at least 60 characters (bcrypt output)'],
    },
    // Optional profile fields (backward compatible - existing users won't break)
    username: {
      type: String,
      trim: true,
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    tradingStyle: {
      type: String,
      enum: {
        values: Object.values(TradingStyle),
        message: 'Invalid trading style',
      },
    },
    experienceLevel: {
      type: String,
      enum: {
        values: Object.values(ExperienceLevel),
        message: 'Invalid experience level',
      },
    },
    riskLevel: {
      type: String,
      enum: {
        values: Object.values(RiskLevel),
        message: 'Invalid risk level',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Note: email index is already created by unique: true above, no need for explicit index

// Remove password hash from JSON responses for security
userSchema.set('toJSON', {
  transform: function (_doc, ret: any) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
