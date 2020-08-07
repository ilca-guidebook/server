const mongoose = require('mongoose');

const SectorSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
    image: { type: String },
});

module.exports = mongoose.model('Sector', SectorSchema);
