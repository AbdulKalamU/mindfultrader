import mongoose, { Schema } from 'mongoose';

/**
 * Session interface representing the Session document structure
 * Used by express-session with connect-mongo for session storage
 */
export interface ISession {
  _id: string; // Session ID (used as cookie value)
  session: any; // Session data (managed by express-session)
  expires: Date;
}

/**
 * Session schema definition
 * Stores user session data with expiration tracking
 * Note: connect-mongo automatically manages this collection
 */
const sessionSchema = new Schema<ISession>(
  {
    _id: {
      type: String,
      required: true,
    },
    session: {
      type: Schema.Types.Mixed,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
      index: true, // Index for efficient cleanup of expired sessions
    },
  },
  {
    collection: 'sessions', // Explicit collection name for connect-mongo
    timestamps: false,
  }
);

// TTL index to automatically delete expired sessions
sessionSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);
