const cron = require('node-cron');
const Application = require('../models/Application');
const User = require('../models/User');
const sendFollowUpEmail = require('../utils/sendEmail');

const checkFollowUps = async () => {
  console.log('Checking for follow-ups due tomorrow...');

  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  try {
    const dueApplications = await Application.find({
      followUpDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
      status: { $nin: ['Offer', 'Rejected'] },
    }).populate('user');

    // Group applications by user, since one user might have multiple due tomorrow
    const grouped = {};
    dueApplications.forEach((app) => {
      const userId = app.user._id.toString();
      if (!grouped[userId]) {
        grouped[userId] = { user: app.user, apps: [] };
      }
      grouped[userId].apps.push(app);
    });

    for (const userId in grouped) {
      const { user, apps } = grouped[userId];
      await sendFollowUpEmail(user.email, user.name, apps);
    }

    console.log(`Checked ${dueApplications.length} due follow-up(s) across ${Object.keys(grouped).length} user(s).`);
  } catch (err) {
    console.error('Follow-up check error:', err);
  }
};

const startFollowUpReminder = () => {
  // Runs every day at 9:00 AM server time
  cron.schedule('0 9 * * *', checkFollowUps);
  console.log('Follow-up reminder job scheduled (daily at 9 AM).');
};

module.exports = { startFollowUpReminder, checkFollowUps };