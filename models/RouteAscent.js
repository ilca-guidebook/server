import mongoose from 'mongoose';
import moment from 'moment';

export const ASCENT_TYPES = ['onsight', 'flash', 'redpoint'];

const RouteAscentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    routeId: { type: String, required: true },
    numOfAttempts: { type: Number, required: true },
    ascentDate: { type: Date, required: true },
    ascentType: { type: String, enum: ASCENT_TYPES },
    stars: { type: Number },
    comment: { type: String },
  },
  { timestamps: true }
);

RouteAscentSchema.methods.toJSON = function () {
  return {
    id: this._id,
    userId: this.userId,
    routeId: this.routeId,
    numOfAttempts: this.numOfAttempts,
    ascentDate: moment.utc(this.ascentDate).format('YYYY-MM-DD'),
    ascentType: this.ascentType,
    stars: this.stars,
    comment: this.comment,
  };
};

export default mongoose.model('RouteAscent', RouteAscentSchema);
