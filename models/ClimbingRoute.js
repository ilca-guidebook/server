import mongoose from 'mongoose';
import { grades, routeTypes } from '../enums/ClimbingRoutes';

const ClimbingRouteSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    metaData: {
        grade: { type: String, enum: grades },
        bolts: { type: Number },
        height: { type: Number },
        firstAscent: { type: String },
        bolter: { type: String },
        routeType: { type: String, enum: routeTypes },
    },
});

export default mongoose.model('ClimbingRoute', ClimbingRouteSchema);
