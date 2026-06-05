import mongoose from 'mongoose';

export const ENotificationType = {
  REQUEST_RECEIVED: 'request_received',
  REQUEST_ACCEPTED: 'request_accepted',
  REQUEST_DECLINED: 'request_declined',
} as const;

export type TNotificationType = (typeof ENotificationType)[keyof typeof ENotificationType];

const NotificationTrackerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    read: { type: Boolean, default: false },
    type: { type: String, enum: Object.values(ENotificationType), required: true },
  },
  { timestamps: true }
);

NotificationTrackerSchema.methods.toJSON = function () {
  return {
    id: this._id,
    userId: this.userId,
    read: this.read,
    type: this.type,
  };
};

export default mongoose.model('NotificationTracker', NotificationTrackerSchema);
