const mongoose = require('mongoose');

async function connectDB() {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('MONGO_URI not set in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', (err && err.message) || err);
        process.exit(1);
    }
}

module.exports = { connectDB, mongoose };
