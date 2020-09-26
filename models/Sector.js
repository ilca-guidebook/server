import mongoose from 'mongoose';

const SectorSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
    imageUrl: { type: String },
});

export default mongoose.model('Sector', SectorSchema);
