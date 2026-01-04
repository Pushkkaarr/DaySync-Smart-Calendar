const cron = require('node-cron');
const Event = require('../models/Event');
const User = require('../models/User'); // Assuming you have a User model for email
const sendEmail = require('./emailService');

const startReminderService = () => {
    // Check every 14 minutes for upcoming events and send reminders
    cron.schedule('*/14 * * * *', async () => {
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
                        `📅 Reminder: "${event.title}" is Tomorrow!`,
                        `<!DOCTYPE html>
                        <html>
                        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px;">
                            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden;">
                                <!-- Header -->
                                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; color: white;">
                                    <h2 style="margin: 0; font-size: 24px; font-weight: bold;">📅 Event Reminder</h2>
                                    <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Your event is coming tomorrow!</p>
                                </div>
                                
                                <!-- Main Content -->
                                <div style="padding: 40px 30px;">
                                    <!-- Event Title -->
                                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
                                        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${event.title}</h1>
                                    </div>
                                    
                                    <!-- Time Details -->
                                    <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                        <p style="margin: 8px 0; color: #333;">
                                            <strong>⏰ Start Time:</strong><br/>
                                            <span style="font-size: 16px; color: #667eea;">${event.start_time.toLocaleString()}</span>
                                        </p>
                                        <p style="margin: 12px 0 0 0; color: #333;">
                                            <strong>🏁 End Time:</strong><br/>
                                            <span style="font-size: 16px; color: #667eea;">${event.end_time.toLocaleString()}</span>
                                        </p>
                                    </div>
                                    
                                    <!-- CTA Button -->
                                    <div style="text-align: center; margin: 30px 0;">
                                        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Don't miss out! Get ready for your event.</p>
                                        <a href="http://localhost:3000/home" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px;">
                                            📋 View Calendar
                                        </a>
                                    </div>
                                </div>
                                
                                <!-- Footer -->
                                <div style="background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                                    <p style="margin: 0; color: #999; font-size: 12px;">✨ DaySync Smart Calendar ✨</p>
                                    <p style="margin: 5px 0 0 0; color: #999; font-size: 11px;">Keep your schedule organized and never miss an event</p>
                                </div>
                            </div>
                        </body>
                        </html>`
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
                        `⏰ URGENT: "${event.title}" starts in 1 HOUR!`,
                        `<!DOCTYPE html>
                        <html>
                        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); margin: 0; padding: 20px;">
                            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden;">
                                <!-- Alert Header -->
                                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px 20px; text-align: center; color: white; border-bottom: 3px solid #ff3333;">
                                    <h2 style="margin: 0; font-size: 28px; font-weight: bold;">⏰ 1 HOUR UNTIL START!</h2>
                                    <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">It's time to get ready</p>
                                </div>
                                
                                <!-- Main Content -->
                                <div style="padding: 40px 30px;">
                                    <!-- Event Title with Urgency -->
                                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center; box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);">
                                        <h1 style="margin: 0; font-size: 32px; font-weight: bold;">${event.title}</h1>
                                        <p style="margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">Starting Very Soon! ⚡</p>
                                    </div>
                                    
                                    <!-- Time Details - Urgent Style -->
                                    <div style="background: linear-gradient(135deg, #ffe5e5 0%, #fff0f0 100%); border-left: 5px solid #f5576c; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                        <p style="margin: 8px 0; color: #333;">
                                            <strong style="font-size: 18px; color: #f5576c;">🎯 Exact Start Time:</strong><br/>
                                            <span style="font-size: 18px; font-weight: bold; color: #f5576c;">${event.start_time.toLocaleString()}</span>
                                        </p>
                                        <p style="margin: 12px 0 0 0; color: #333;">
                                            <strong style="font-size: 16px; color: #f5576c;">⏳ End Time:</strong><br/>
                                            <span style="font-size: 16px; color: #666;">${event.end_time.toLocaleString()}</span>
                                        </p>
                                    </div>
                                    
                                    <!-- Countdown Alert -->
                                    <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                                        <p style="margin: 0; color: #856404; font-weight: bold; font-size: 16px;">
                                            ⏳ ONLY 60 MINUTES LEFT!
                                        </p>
                                    </div>
                                    
                                    <!-- CTA Button -->
                                    <div style="text-align: center; margin: 30px 0;">
                                        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Quick! Prepare yourself and join in time.</p>
                                        <a href="http://localhost:3000/home" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);">
                                            🚀 OPEN CALENDAR NOW
                                        </a>
                                    </div>
                                </div>
                                
                                <!-- Footer -->
                                <div style="background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                                    <p style="margin: 0; color: #999; font-size: 12px;">⏰ DaySync Smart Calendar ⏰</p>
                                    <p style="margin: 5px 0 0 0; color: #999; font-size: 11px;">Never miss an event - Your reliable scheduling assistant</p>
                                </div>
                            </div>
                        </body>
                        </html>`
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
