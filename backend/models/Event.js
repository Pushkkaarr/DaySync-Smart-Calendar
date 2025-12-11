const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    color: { type: String, default: '#3b82f6' },
    recurrencePattern: { type: String, enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'], default: 'none' },
    recurrenceGroupId: { type: String }, // To link recurring events together
    is24hReminderSent: { type: Boolean, default: false },
    is1hReminderSent: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
