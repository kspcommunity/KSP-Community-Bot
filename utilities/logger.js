const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const axios = require('axios');

const logsFolder = './logs';

// Create a "logs" folder if it doesn't exist
if (!fs.existsSync(logsFolder)) {
  fs.mkdirSync(logsFolder);
}

// ANSI escape codes for text color
const colors = {
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m' // Red
};

const logToFile = (message, level) => {
  const currentDate = format(new Date(), 'dd-MM-yyyy');
  const logFileName = `./logs/${currentDate}.log`;

  const logMessage = `[${level.toUpperCase()}] [${format(new Date(), 'HH:mm:ss')}] ${message}\n`;

  fs.appendFileSync(logFileName, logMessage, 'utf8');
};

const logToWebhook = async (message, level) => {
  try {
    const currentDate = format(new Date(), 'dd-MM-yyyy');
    const webhookUrl = process.env.WEBHOOK_URL;

    const color = level.toLowerCase() === 'error' ? 0xFF0000 : 0xFFA500; // Red for error, orange for warn

    await axios.post(webhookUrl, {
      embeds: [
        {
          title: `${level.toUpperCase()} Log - ${currentDate}`,
          description: `\`\`\`${message}\`\`\``,
          color: color,
        },
      ],
    });
  } catch (error) {
    console.error('Error sending log to webhook:', error.message);
  }
};

const log = async (message, level = 'info') => {
  // Log to console
  const color = colors[level.toLowerCase()] || colors['info']; // Default to green if level is unknown
  console.log(`${color}[${level.toUpperCase()}] ${message}\x1b[0m`); // Reset color after the message

  // Log to file
  logToFile(message, level);

  // Log to webhook only for errors and warnings
  if (['error', 'warn'].includes(level.toLowerCase())) {
    await logToWebhook(message, level);
  }
};

module.exports = { log };
