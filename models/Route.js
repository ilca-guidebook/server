const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    image: { type: String },
    metaData: {
        grade: { type: String },
        quickDraws: { type: Number },
        height: { type: String },
    },
});

module.exports = mongoose.model('Route', RouteSchema);
