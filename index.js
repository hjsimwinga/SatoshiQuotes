// index.js
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configure environment variables
dotenv.config();

// Get directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Array to hold our bot processes
const bots = [];

// Function to start a bot
function startBot(scriptName) {
  const bot = fork(path.join(__dirname, `${scriptName}.js`), {
    stdio: 'inherit',
    env: process.env
  });

  bot.on('error', (err) => {
    console.error(`❌ Error starting ${scriptName}:`, err);
  });

  bot.on('exit', (code, signal) => {
    console.warn(`⚠️ ${scriptName} exited with code ${code} (signal: ${signal})`);
    // Restart the bot after a delay if it crashes
    setTimeout(() => {
      console.log(`♻️ Restarting ${scriptName}...`);
      bots[bots.findIndex(b => b === bot)] = startBot(scriptName);
    }, 5000);
  });

  return bot;
}

// Start both bots
bots.push(startBot('satoshi-qoutes'));
bots.push(startBot('welcome-bot'));

// Handle process termination
function shutdown() {
  console.log('\n🛑 Shutting down bots...');
  bots.forEach(bot => {
    try {
      bot.kill();
    } catch (err) {
      console.error('Error killing bot process:', err);
    }
  });
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('🚀 Nostr Bots Manager started');
console.log(`- Satoshi Quotes Bot: PID ${bots[0].pid}`);
console.log(`- Welcome Bot: PID ${bots[1].pid}`);