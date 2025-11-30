const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    color: { type: String, default: '#3b82f6' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
