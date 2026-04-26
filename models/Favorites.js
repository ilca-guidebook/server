import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    routeId: { type: String, required: true },
  },
  { timestamps: true }
);

FavoriteSchema.index({ userId: 1, routeId: 1 }, { unique: true });

FavoriteSchema.methods.toJSON = function () {
  return {
    id: this._id,
    routeId: this.routeId,
  };
};

export default mongoose.model('Favorite', FavoriteSchema);
