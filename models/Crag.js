import mongoose from 'mongoose';
import { areas } from '../enums/Crags';

const CragSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    location: {
        lng: { type: Number },
        lt: { type: Number },
        wazeLink: { type: String },
        description: { type: String },
        area: { type: String, enum: areas },
    },
    imageUrl: { type: String },
    sectors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sector' }],
});

export default module.exports = mongoose.model('Crag', CragSchema);
