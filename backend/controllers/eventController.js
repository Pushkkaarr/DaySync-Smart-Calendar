const Event = require('../models/Event');

exports.createEvent = async (req, res) => {
    try {
        const { title, start_time, end_time, color } = req.body;
        const newEvent = new Event({ title, start_time, end_time, color });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let query = {};

        // If date range is provided, filter by it
        if (start_date && end_date) {
            query = {
                start_time: {
                    $gte: new Date(start_date),
                    $lte: new Date(end_date)
                }
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
        const updatedEvent = await Event.findByIdAndUpdate(id, { title, start_time, end_time, color }, { new: true });
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await Event.findByIdAndDelete(id);
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
