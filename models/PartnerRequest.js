import mongoose from 'mongoose';
import moment from 'moment';

export const PARTNER_REQUEST_STATUSES = ['pending', 'accepted', 'declined'];

const PartnerRequestSchema = new mongoose.Schema(
  {
    searchId: { type: String, required: true, index: true },
    requesterId: { type: String, required: true, index: true },
    recipientId: { type: String, required: true, index: true },
    status: { type: String, enum: PARTNER_REQUEST_STATUSES, default: 'pending', index: true },
  },
  { timestamps: true }
);

PartnerRequestSchema.methods.toJSON = function () {
  return {
    id: this._id,
    searchId: this.searchId,
    requesterId: this.requesterId,
    recipientId: this.recipientId,
    status: this.status,
    createdAt: moment.utc(this.createdAt).toISOString(),
  };
};

export default mongoose.model('PartnerRequest', PartnerRequestSchema);
