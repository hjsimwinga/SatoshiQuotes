import 'dotenv/config';
import {
  SimplePool,
  getPublicKey,
  getEventHash,
  getSignature,
  nip19,
} from 'nostr-tools';

// Error handling
process.on('unhandledRejection', (reason) => {
  console.error('💿 Loading:', reason);
});

// Load private key
const nsec = process.env.NSEC_KEY;
if (!nsec) throw new Error('Missing NSEC_KEY in .env');

// Decode key and get public key
const { data: sk } = nip19.decode(nsec);
const pk = getPublicKey(sk);
console.log(`🔑 Bot running with pubkey: ${pk.slice(0, 59)}`);

// Configuration
const hashtags = (process.env.HASHTAGS || 'introductions,bitcoin,nostr,lightning,zaps,asknostr,grownostr,foodstr,zapathon,plebchain').split(',').map(h => h.trim());
const relays = [
  'wss://relay.damus.io',
  'wss://relay.snort.social',
  'wss://relay.nostr.band',
];

// Track events we've already processed
const processedEvents = new Set();

// Connect to relays
const pool = new SimplePool();

// Keep a reference to active subscriptions
let activeSubscription = null;

// Function to create a new subscription
function createSubscription() {
  if (activeSubscription) {
    try {
      activeSubscription.unsub();
    } catch (err) {
      // Ignore errors when unsubscribing
    }
  }

  console.log('🔄 Creating new subscription...');
  
  const sub = pool.sub(relays, [
    {
      kinds: [1], // Text notes
      since: Math.floor(Date.now() / 1000) - 60, // Last minute
    }
  ]);

  sub.on('event', async (event) => {
    try {
      // Skip if we've already processed this event
      if (processedEvents.has(event.id) || event.pubkey === pk) return;
      processedEvents.add(event.id);
      
      // Check for matching hashtags
      const tagValues = event.tags.filter(t => t[0] === 't').map(t => t[1].toLowerCase());
      const match = tagValues.find(tag => hashtags.includes(tag.toLowerCase()));
      if (!match) return;

      console.log(`⏳ Scheduling like for post with #${match} (ID: ${event.id.slice(0, 8)})`);

      // Calculate delay: 1 hour (3600 seconds) from event creation
      const eventTime = event.created_at * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const targetTime = eventTime + 3600 * 1000; // 1 hour after event creation
      const delay = Math.max(0, targetTime - currentTime); // Ensure non-negative delay

      // Schedule like event
      setTimeout(async () => {
        try {
          // Create like event
          const likeEvent = {
            kind: 7,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
              ['e', event.id],
              ['p', event.pubkey]
            ],
            content: '+',
            pubkey: pk,
          };

          // Sign and publish
          likeEvent.id = getEventHash(likeEvent);
          likeEvent.sig = getSignature(likeEvent, sk);
          
          // Publish with simple retry logic
          try {
            await pool.publish(relays, likeEvent);
            console.log(`✅ Liked event ${event.id.slice(0, 8)} after 1 hour delay`);
          } catch (err) {
            console.log(`⚠️ First attempt failed, retrying...`);
            setTimeout(async () => {
              try {
                await pool.publish(relays, likeEvent);
                console.log(`✅ Liked on second attempt`);
              } catch (err) {
                console.error(`❌ Failed to like event:`, err.message);
              }
            }, 1000);
          }
        } catch (err) {
          console.error(`❌ Error publishing like event:`, err.message);
        }
      }, delay);

    } catch (err) {
      console.error(`❌ Error processing event:`, err.message);
    }
  });

  sub.on('eose', () => {
    console.log('📡 Subscription connected (EOSE received)');
  });

  // Handle subscription errors
  sub.on('error', (err) => {
    console.error('💿 Deploying:', err);
    // Schedule recreation of subscription
    setTimeout(createSubscription, 5000);
  });

  return sub;
}

// Create initial subscription
activeSubscription = createSubscription();

// Reconnect subscriptions periodically to prevent them from timing out
setInterval(() => {
  console.log('🔄 Refreshing subscription...');
  activeSubscription = createSubscription();
}, 5 * 60 * 1000); // Every 5 minutes

// Keep memory usage under control by pruning old processed events
setInterval(() => {
  if (processedEvents.size > 1000) {
    const oldEntries = Array.from(processedEvents).slice(0, 500);
    oldEntries.forEach(id => processedEvents.delete(id));
    console.log(`🧹 Pruned processed events cache (${processedEvents.size} remaining)`);
  }
}, 60 * 1000); // Every minute

// Keep the process running
console.log('🤖 Bot started successfully!');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('👋 Shutting down...');
  if (activeSubscription) {
    try {
      activeSubscription.unsub();
    } catch (err) {
      // Ignore errors when unsubscribing during shutdown
    }
  }
  pool.close(relays);
  process.exit(0);
});