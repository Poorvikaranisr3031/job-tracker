const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendFollowUpEmail = async (toEmail, userName, applications) => {
  const listHtml = applications
    .map((app) => `<li><strong>${app.company}</strong> — ${app.role}</li>`)
    .join('');

  try {
    await resend.emails.send({
      from: 'Job Tracker <onboarding@resend.dev>',
      to: toEmail,
      subject: `You have ${applications.length} follow-up${applications.length > 1 ? 's' : ''} due tomorrow`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>Hi ${userName},</h2>
          <p>You have the following follow-up${applications.length > 1 ? 's' : ''} due tomorrow:</p>
          <ul>${listHtml}</ul>
          <p>Log in to your Job Tracker to update their status.</p>
        </div>
      `,
    });
    console.log(`Follow-up email sent to ${toEmail}`);
  } catch (err) {
    console.error('Email send error:', err);
  }
};

module.exports = sendFollowUpEmail;