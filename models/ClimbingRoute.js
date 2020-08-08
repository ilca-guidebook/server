const mongoose = require('mongoose');
const { grades, routeTypes } = require('../enums/ClimbingRoutes');

const ClimbingRouteSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    metaData: {
        grade: { type: String, enum: [grades] },
        quickDraws: { type: Number },
        height: { type: Number },
        firstAscent: { type: String },
        bolter: { type: String },
        routeType: { type: String, enum: [routeTypes] }
    },
});

module.exports = mongoose.model('ClimbingRoute', ClimbingRouteSchema);
