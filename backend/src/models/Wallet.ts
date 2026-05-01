import mongoose, { Document, Schema } from 'mongoose';

/**
 * Transaction type enum
 */
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRADE = 'trade',
}

/**
 * Transaction interface
 */
export interface ITransaction {
  type: TransactionType;
  amount: number;
  date: Date;
  description?: string;
}

/**
 * Wallet interface representing the Wallet document structure
 */
export interface IWallet extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transaction schema
 */
const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: Object.values(TransactionType),
        message: 'Transaction type must be deposit, withdraw, or trade',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
  },
  { _id: false } // Don't create _id for subdocuments
);

/**
 * Wallet schema definition
 * Stores user wallet data with balance and transaction history
 */
const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true, // One wallet per user
      index: true,
    },
    balance: {
      type: Number,
      required: [true, 'Balance is required'],
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    transactions: {
      type: [transactionSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for efficient user wallet lookups
walletSchema.index({ userId: 1 });

export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);
