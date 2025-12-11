const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL, // Use only environment variable
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
}));

// Connect to MongoDB
const { connectDB } = require('./config/db');

// Connect to MongoDB
connectDB();
const startReminderService = require('./utils/reminderService');
startReminderService();

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Keep-alive ping to prevent Render app from sleeping
    const url = process.env.B_LINK; // Your Render app URL
    const interval = 13 * 60 * 1000; // 13 minutes

    // Keep-alive ping to prevent Render app from sleeping
    if (url) {
        setInterval(() => {
            axios.get(url)
                .then(response => {
                    // Ping successful
                })
                .catch(error => {
                    console.error(`Keep-alive ping error at ${new Date().toISOString()}:`, error.message);
                });
        }, interval);
    }
});