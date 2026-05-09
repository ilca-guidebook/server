import mongoose from 'mongoose';

const CragFavoriteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    cragId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

CragFavoriteSchema.index({ userId: 1, cragId: 1 }, { unique: true });

CragFavoriteSchema.methods.toJSON = function () {
  return {
    id: this._id,
    cragId: this.cragId,
  };
};

export default mongoose.model('CragFavorite', CragFavoriteSchema);
