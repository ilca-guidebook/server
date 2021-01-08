import mongoose from 'mongoose';
import { grades, routeTypes } from '../enums/ClimbingRoutes';

const ClimbingRouteSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    metaData: {
        grade: { type: String, enum: grades },
        routeType: { type: String, enum: routeTypes },
        setBy: { type: String },
        bolts: { type: Number },
        height: { type: Number },
        firstAscent: { type: String },
    },
});

export default mongoose.model('ClimbingRoute', ClimbingRouteSchema);
