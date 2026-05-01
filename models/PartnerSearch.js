import mongoose from 'mongoose';
import moment from 'moment';

export const RIDE_ROLES = ['can-pickup', 'needs-ride', 'self'];
export const PARTNER_SEARCH_STATUSES = ['active', 'matched'];

const PartnerSearchSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    cragIds: { type: [String], required: true },
    date: { type: String, required: true },
    leaveHomeHour: { type: String, required: true },
    leaveCragHour: { type: String, required: true },
    rideRole: { type: String, enum: RIDE_ROLES, required: true },
    leaveFromAddress: { type: String, required: true },
    status: { type: String, enum: PARTNER_SEARCH_STATUSES, default: 'active', index: true },
    matchedWithUserId: { type: String },
  },
  { timestamps: true }
);

PartnerSearchSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['active', 'matched'] } },
  }
);

PartnerSearchSchema.methods.toJSON = function () {
  return {
    id: this._id,
    userId: this.userId,
    cragIds: this.cragIds,
    date: this.date,
    leaveHomeHour: this.leaveHomeHour,
    leaveCragHour: this.leaveCragHour,
    rideRole: this.rideRole,
    leaveFromAddress: this.leaveFromAddress,
    status: this.status,
    matchedWithUserId: this.matchedWithUserId,
    createdAt: moment.utc(this.createdAt).toISOString(),
  };
};

export default mongoose.model('PartnerSearch', PartnerSearchSchema);
