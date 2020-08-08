import mongoose from 'mongoose';

const CragSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    location: {
        lng: { type: Number },
        lt: { type: Number },
        wazeLink: { type: String },
    },
    imageUrl: { type: String },
    sectors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sector' }],
    routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
});

export default module.exports = mongoose.model('Crag', CragSchema);
