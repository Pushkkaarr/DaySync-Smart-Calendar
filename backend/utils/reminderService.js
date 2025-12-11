const cron = require('node-cron');
const Event = require('../models/Event');
const User = require('../models/User'); // Assuming you have a User model for email
const sendEmail = require('./emailService');

const startReminderService = () => {
    // Check every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Tolerance window (e.g., event starts within the target minute)
            const tolerance = 60 * 1000;

            // --- 24 Hour Reminders ---
            // Find events starting between 24h and 24h + 1min from now, and reminder not sent
            const events24h = await Event.find({
                start_time: {
                    $gte: twentyFourHoursLater,
                    $lt: new Date(twentyFourHoursLater.getTime() + tolerance)
                },
                is24hReminderSent: false
            }).populate('userId');

            for (const event of events24h) {
                if (event.userId && event.userId.email) {
                    const sent = await sendEmail(
                        event.userId.email,
                        `Reminder: "${event.title}" is Tomorrow`,
                        `<div style="font-family: Arial, sans-serif; color: #333;">
                            <h2>This mail is sent from DaySync Calendar</h2>
                            <p>This is a friendly reminder for your upcoming event.</p>
                            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #2563eb;">${event.title}</h3>
                                <p><strong>Starts:</strong> ${event.start_time.toLocaleString()}</p>
                                <p><strong>Ends:</strong> ${event.end_time.toLocaleString()}</p>
                            </div>
                            <p>This event starts in approximately 24 hours.</p>
                        </div>`
                    );
                    if (sent) {
                        event.is24hReminderSent = true;
                        await event.save();
                    }
                }
            }

            // --- 1 Hour Reminders ---
            const events1h = await Event.find({
                start_time: {
                    $gte: oneHourLater,
                    $lt: new Date(oneHourLater.getTime() + tolerance)
                },
                is1hReminderSent: false
            }).populate('userId');

            for (const event of events1h) {
                if (event.userId && event.userId.email) {
                    const sent = await sendEmail(
                        event.userId.email,
                        `Reminder: "${event.title}" starts in 1 Hour`,
                        `<div style="font-family: Arial, sans-serif; color: #333;">
                            <h2>This mail is sent from DaySync Calendar</h2>
                            <p>This is a friendly reminder for your upcoming event.</p>
                            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #2563eb;">${event.title}</h3>
                                <p><strong>Starts:</strong> ${event.start_time.toLocaleString()}</p>
                                <p><strong>Ends:</strong> ${event.end_time.toLocaleString()}</p>
                            </div>
                            <p>This event starts in approximately 1 hour.</p>
                        </div>`
                    );
                    if (sent) {
                        event.is1hReminderSent = true;
                        await event.save();
                    }
                }
            }

        } catch (error) {
            console.error('Reminder service error:', error);
        }
    });
};

module.exports = startReminderService;
