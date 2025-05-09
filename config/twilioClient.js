const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_API_KEY_SID,
  process.env.TWILIO_API_KEY_SECRET,
  {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
  }
);

module.exports = client;
