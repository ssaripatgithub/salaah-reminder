const { PrayTime } = require('praytime');
const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

// Config
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const tagbilaranCoords = [9.6496, 123.8556]; // Tagbilaran, Bohol

// Initialize PrayTime
const praytime = new PrayTime('MWL');
praytime.location(tagbilaranCoords);

// Function to send Telegram message
async function sendMessage(text) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text
    });
    console.log("Message sent:", text);
  } catch (err) {
    console.error("Error sending message:", err.response?.data || err.message);
  }
}

// Helper: Schedule reminders for a given day's prayer times
function scheduleDailyReminders() {
  const times = praytime.getTimes();

  console.log("Today's prayer times:", times);

  Object.entries(times).forEach(prayer => {
    const [prayerName, timeStr] = prayer;
    let [hour, minute] = timeStr.split(':').map(Number);

    // Subtract 10 minutes for reminder
    minute -= 10;
    if (minute < 0) {
      minute += 60;
      hour = hour === 0 ? 23 : hour - 1;
    }

    const cronTime = `${minute} ${hour} * * *`;

    cron.schedule(cronTime, () => {
      sendMessage(`⏰ ${prayerName.charAt(0).toUpperCase() + prayerName.slice(1)} in 10 minutes`);
    });

    console.log(`Scheduled ${prayerName} reminder at ${cronTime}`);
  });
}

// Schedule reminders today immediately
scheduleDailyReminders();

// Schedule recalculation at midnight every day
cron.schedule('0 0 * * *', () => {
  console.log("Recalculating prayer times for new day...");
  scheduleDailyReminders();
});
