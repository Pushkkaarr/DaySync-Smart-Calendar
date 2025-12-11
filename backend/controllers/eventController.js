const Event = require('../models/Event');

exports.createEvent = async (req, res) => {
    try {
        const { title, start_time, end_time, color, recurrencePattern } = req.body;
        const userId = req.user._id;

        // Base event data
        const baseEventData = {
            userId,
            title,
            color,
            recurrencePattern: recurrencePattern || 'none'
        };

        if (!recurrencePattern || recurrencePattern === 'none') {
            const newEvent = new Event({
                ...baseEventData,
                start_time,
                end_time
            });
            await newEvent.save();
            return res.status(201).json(newEvent);
        }

        // Handle Recurrence
        const eventsToCreate = [];
        const recurrenceGroupId = new Date().getTime().toString() + Math.random().toString(36).substring(7);

        // Limits
        const MAX_YEARS = 1;
        const startDate = new Date(start_time);
        const endDate = new Date(end_time);
        const duration = endDate.getTime() - startDate.getTime();

        const limitDate = new Date(startDate);
        limitDate.setFullYear(limitDate.getFullYear() + MAX_YEARS);

        let currentStart = new Date(startDate);

        while (currentStart < limitDate) {
            eventsToCreate.push({
                ...baseEventData,
                start_time: new Date(currentStart),
                end_time: new Date(currentStart.getTime() + duration),
                recurrenceGroupId
            });

            // Advance date
            switch (recurrencePattern) {
                case 'daily':
                    currentStart.setDate(currentStart.getDate() + 1);
                    break;
                case 'weekly':
                    currentStart.setDate(currentStart.getDate() + 7);
                    break;
                case 'monthly':
                    currentStart.setMonth(currentStart.getMonth() + 1);
                    break;
                case 'yearly':
                    currentStart.setFullYear(currentStart.getFullYear() + 1);
                    break;
                default:
                    currentStart = limitDate; // Break loop
            }
        }

        // Bulk insert for efficiency
        const createdEvents = await Event.insertMany(eventsToCreate);
        res.status(201).json(createdEvents[0]); // Return the first one as confirmation
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let query = { userId: req.user._id };

        // If date range is provided, filter by it
        if (start_date && end_date) {
            query.start_time = {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            };
        }

        const events = await Event.find(query);
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, start_time, end_time, color } = req.body;

        // Verify the event belongs to the user
        const event = await Event.findOne({ _id: id, userId: req.user._id });
        if (!event) {
            return res.status(404).json({ message: 'Event not found or unauthorized' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { title, start_time, end_time, color, updated_at: Date.now() },
            { new: true }
        );
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { deleteType } = req.query; // 'single' or 'series'

        // Verify the event belongs to the user
        const event = await Event.findOne({ _id: id, userId: req.user._id });
        if (!event) {
            return res.status(404).json({ message: 'Event not found or unauthorized' });
        }

        if (deleteType === 'series' && event.recurrenceGroupId) {
            // Delete all events with the same recurrenceGroupId
            await Event.deleteMany({
                recurrenceGroupId: event.recurrenceGroupId,
                userId: req.user._id
            });
            res.status(200).json({ message: 'Event series deleted successfully' });
        } else {
            // Delete single event
            await Event.findByIdAndDelete(id);
            res.status(200).json({ message: 'Event deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRecentChanges = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        // Get recent events sorted by updated_at (most recent first)
        const recentEvents = await Event.find({ userId: req.user._id })
            .sort({ updated_at: -1, created_at: -1 })
            .limit(limit);

        res.status(200).json(recentEvents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
