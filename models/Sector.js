import mongoose from 'mongoose';

const SectorSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    routes: [{ type: mongoose.Schema.ObjectId, ref: 'ClimbingRoute' }],
    imageUrl: { type: String },
});

export default mongoose.model('Sector', SectorSchema);
