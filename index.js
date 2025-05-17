// Manager for both bots
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Start both bots
const bots = [
  fork(path.join(__dirname, 'satoshi-qoutes.js')),
  fork(path.join(__dirname, 'welcome-bot.js'))
];

// Handle shutdown
process.on('SIGINT', () => {
  bots.forEach(bot => bot.kill());
  process.exit();
});