const Event = require('../models/Event');

const sendEmail = require('../utils/emailService'); // Import email service

exports.createEvent = async (req, res) => {
    try {
        const { title, start_time, end_time, color, recurrencePattern } = req.body;
        const userId = req.user._id;
        const userEmail = req.user.email; // Assuming auth middleware populates this

        // Base event data
        const baseEventData = {
            userId,
            title,
            color,
            recurrencePattern: recurrencePattern || 'none'
        };

        let createdEventForMail = null;

        if (!recurrencePattern || recurrencePattern === 'none') {
            const newEvent = new Event({
                ...baseEventData,
                start_time,
                end_time
            });
            await newEvent.save();
            createdEventForMail = newEvent;
            res.status(201).json(newEvent);
        } else {
            // ... (Recurrence logic remains the same) ...
            // Handle Recurrence
            const eventsToCreate = [];
            const recurrenceGroupId = new Date().getTime().toString() + Math.random().toString(36).substring(7);

            // Limits
            let maxOccurrences = 0;
            switch (recurrencePattern) {
                case 'daily': maxOccurrences = 365; break;  // 1 Year
                case 'weekly': maxOccurrences = 52; break;  // 1 Year
                case 'monthly': maxOccurrences = 12; break; // 1 Year
                case 'yearly': maxOccurrences = 10; break;  // 10 Years
                default: maxOccurrences = 1;
            }

            const startDate = new Date(start_time);
            const endDate = new Date(end_time);
            const duration = endDate.getTime() - startDate.getTime();

            console.log(`Generating ${maxOccurrences} instances for pattern: ${recurrencePattern}`);

            let currentStart = new Date(startDate);
            let count = 0;

            while (count < maxOccurrences) {
                eventsToCreate.push({
                    ...baseEventData,
                    start_time: new Date(currentStart),
                    end_time: new Date(currentStart.getTime() + duration),
                    recurrenceGroupId
                });

                // Advance date (same switch logic as before)
                switch (recurrencePattern) {
                    case 'daily': currentStart.setDate(currentStart.getDate() + 1); break;
                    case 'weekly': currentStart.setDate(currentStart.getDate() + 7); break;
                    case 'monthly':
                        const d = currentStart.getDate();
                        currentStart.setMonth(currentStart.getMonth() + 1);
                        if (currentStart.getDate() !== d) currentStart.setDate(0);
                        break;
                    case 'yearly': currentStart.setFullYear(currentStart.getFullYear() + 1); break;
                }
                count++;
            }

            // Bulk insert for efficiency
            const createdEvents = await Event.insertMany(eventsToCreate);
            res.status(201).json(createdEvents[0]);
        }

    } catch (error) {
        console.error("Create Event Error:", error);
        // If response hasn't been sent yet
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
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
