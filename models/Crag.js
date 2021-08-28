import mongoose from 'mongoose';
import { areas, routesTypes } from '../enums/Crags';

const CragSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    routesTypes: [{ type: String, enum: routesTypes }],
    location: {
        lng: { type: Number },
        lat: { type: Number },
        wazeLink: { type: String },
        description: { type: String },
        area: { type: String, enum: areas },
    },
    imageUrl: { type: String },
    sectors: [{ type: mongoose.Schema.ObjectId, ref: 'Sector' }],
    cragFeatures: {
        rockType: { type: String },
        routesLength: { type: String },
        season: { type: String },
        shade: { type: String },
        cellularCoverage: { type: String },
    }
});

export default module.exports = mongoose.model('Crag', CragSchema);
