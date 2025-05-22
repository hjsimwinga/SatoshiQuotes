// satoshi-quotes
import dotenv from 'dotenv';
dotenv.config();

import { SimplePool, nip19, getEventHash, getSignature, getPublicKey } from 'nostr-tools';
import 'websocket-polyfill';

// Load private key from .env
const NSEC_KEY = process.env.NSEC_KEY;

if (!NSEC_KEY) {
  throw new Error("NSEC_KEY is missing from .env file");
}

// Decode key and init
const privateKey = nip19.decode(NSEC_KEY).data;
const publicKey = getPublicKey(privateKey);

// Relay config
const RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social'
];

const pool = new SimplePool();

// DOWN SIMPLE CODE "UP IT CRITCAL"


// Quote database
const SATOSHI_QUOTES = [
  "Bitcoin is a tool for freedom.",
  "It’s the separation of money and state.",
  "We can win a major battle in the arms race and gain a new territory of freedom for several years.",
  "Bitcoin is not just a currency, it's a movement.",
  "I hope Bitcoin can give people more control over their money.",
  "The root problem with conventional currency is all the trust that’s required to make it work.",
  "Banks must be trusted to hold our money and transfer it electronically, but they lend it out in waves of credit bubbles with barely a fraction in reserve.",
  "I’ve been working on a new electronic cash system that’s fully peer-to-peer, with no trusted third party.",
  "What is needed is an electronic payment system based on cryptographic proof instead of trust.",
  "We have proposed a system for electronic transactions without relying on trust.",
  "The network is robust in its unstructured simplicity.",
  "I’ve designed Bitcoin to solve the double-spending problem without a trusted authority or central server.",
  "The steady addition of a constant amount of new coins is analogous to gold miners expending resources to add gold to circulation.",
  "By convention, the first transaction in a block is a special transaction that starts a new coin owned by the creator of the block.",
  "Nodes always consider the longest chain to be the correct one and will keep working on extending it.",
  "If a majority of CPU power is controlled by honest nodes, the honest chain will grow the fastest and outpace any competing chains.",
  "To modify a past block, an attacker would have to redo the proof-of-work of that block and all blocks after it.",
  "The proof-of-work difficulty is adjusted every 2016 blocks to keep the average time between new blocks at ten minutes.",
  "New coins are generated at a decreasing rate, and eventually the total number of coins will reach a limit of 21 million.",
  "Transaction fees will become the main incentive for miners once the coin generation slows down.",
  "The system is secure as long as honest nodes collectively control more CPU power than any cooperating group of attacker nodes.",
  "Simplified Payment Verification (SPV) allows payment verification without running a full network node.",
  "Bitcoin’s security model relies on proof-of-work, which is costly and difficult to fake.",
  "The block chain is a public ledger of all transactions in the network.",
  "The use of digital signatures provides strong authentication for transactions.",
  "Users can generate new key pairs without contacting any central authority.",
  "A new block is created by finding a hash below a target threshold through brute force.",
  "The decentralized nature of the system removes the need for a central clearinghouse.",
  "Bitcoin addresses are derived from public keys through a hashing process.",
  "Bitcoin nodes validate transactions by checking signatures and the unspent transaction outputs.",
  "The open source nature of Bitcoin encourages community review and collaboration.",
  "Privacy in Bitcoin comes from pseudonymity rather than full anonymity.",
  "Bitcoin wallets store private keys which allow spending of associated coins.",
  "The software incentivizes miners to follow the protocol by rewarding them with new coins and transaction fees.",
  "A blockchain fork happens when two miners solve a block at nearly the same time.",
  "The consensus mechanism ensures all nodes agree on the transaction history.",
  "Mining difficulty adjusts to maintain a consistent rate of new blocks despite changes in total network hash power.",
  "Nodes reject blocks and transactions that violate the protocol rules.",
  "Bitcoin provides a censorship-resistant payment system.",
  "The blockchain timestamp server proves that data existed at a certain point in time.",
  "Each block contains a hash of the previous block, creating a chain.",
  "Bitcoin solves the double-spending problem with a peer-to-peer network and proof-of-work.",
  "The initial distribution of coins is through mining rewards.",
  "The concept of proof-of-work was adapted from Hashcash to secure Bitcoin.",
  "The network nodes form a decentralized network without a central authority.",
  "Bitcoin transactions are irreversible once included in the blockchain.",
  "Users retain full control over their money without relying on banks.",
  "Bitcoin can enable micropayments without high transaction fees.",
  "The mining process serves both as a way to issue new coins and secure the network.",
  "The system is designed to be robust even if some nodes act maliciously.",
  "Bitcoin’s protocol includes rules to prevent inflation and counterfeiting.",
  "It is possible to run a full node and verify transactions independently.",
  "Trust is replaced by mathematical proof and decentralized consensus.",
  "No third party is needed to process or verify payments.",
  "The network operates continuously without downtime.",
  "Bitcoin’s supply schedule is predictable and transparent.",
  "All transactions are publicly visible, but identities are hidden behind addresses.",
  "The cryptographic techniques used are well-tested and secure.",
  "Users can create multiple addresses to increase privacy.",
  "The wallet software can generate a new keypair for each transaction.",
  "The decentralized network is resistant to censorship or control.",
  "Open source development allows anyone to audit and improve the code.",
  "Bitcoin is designed to resist government interference and control.",
  "The mining competition secures the network against attacks.",
  "The protocol evolves through community consensus and BIPs (Bitcoin Improvement Proposals).",
  "Economic incentives align miners’ interests with network security.",
  "The network rewards miners proportional to the computational work they perform.",
  "Bitcoin can enable financial inclusion for the unbanked.",
  "The system is designed to work without trust in any central party.",
  "Bitcoin transactions are broadcasted to the network for validation.",
  "The network verifies transaction validity by checking cryptographic signatures.",
  "Bitcoin nodes store the entire blockchain to verify transactions independently.",
  "The proof-of-work function is intentionally hard to compute but easy to verify.",
  "Nodes always accept the longest valid blockchain as the authoritative ledger.",
  "Bitcoin’s decentralized design removes single points of failure.",
  "Users can verify their balance and transactions independently.",
  "Bitcoin can be used for borderless payments without intermediaries.",
  "The system removes the risk of chargebacks or payment reversals.",
  "Mining pools allow miners to reduce variance in their rewards.",
  "Bitcoin’s design is inspired by decades of cryptographic research.",
  "The system is permissionless; anyone can participate without approval.",
  "Bitcoin can protect users from inflationary monetary policies.",
  "The blockchain provides a permanent record of all transactions.",
  "Bitcoin is designed to be portable money on the internet.",
  "Users maintain control of their private keys at all times.",
  "The system discourages centralization by design.",
  "Bitcoin can be used for remittances with low fees and fast settlement.",
  "The difficulty retargeting algorithm adapts to changes in mining power.",
  "Each block header includes a timestamp and nonce used in mining.",
  "The cryptographic hash function secures the integrity of the blockchain.",
  "Bitcoin’s monetary policy is set in code and transparent to all.",
  "Mining requires significant energy expenditure to secure the network.",
  "The system rewards nodes that follow the rules and punishes cheating.",
  "Bitcoin’s scripting system enables programmable transactions.",
  "Users can create multi-signature wallets for enhanced security.",
  "The protocol supports lightweight clients using Simplified Payment Verification.",
  "Bitcoin is the first decentralized digital currency with practical utility.",
  "The design enables trustless transfer of value over the internet.",
  "Nodes reject invalid transactions to maintain network integrity.",
  "Bitcoin is a network of nodes collectively maintaining a ledger.",
  "The protocol is designed to prevent double spending without a central authority.",
  "Bitcoin replaces trust with mathematical proof and network consensus.",
  "The system is resilient against denial-of-service attacks.",
  "The open ledger allows anyone to audit the currency supply.",
  "The network runs 24/7 with no downtime or centralized control.",
  "Bitcoin can enable new financial applications and services.",
  "The block reward halves approximately every four years to control inflation.",
  "The security of the system depends on honest majority of mining power.",
  "Bitcoin's open design encourages innovation and experimentation.",
  "The community actively develops and improves the protocol.",
  "Bitcoin can provide a new form of money free from censorship.",
  "Transaction fees incentivize miners as the block reward decreases.",
  "Users can verify transactions without trusting any third party.",
  "The system enables peer-to-peer transfer of value globally.",
  "Bitcoin is censorship-resistant by design.",
  "The blockchain is a tamper-evident record of transactions.",
  "Nodes use a proof-of-work chain to agree on transaction history.",
  "Bitcoin solves the Byzantine Generals Problem for digital money.",
  "Users retain full sovereignty over their funds.",
  "Bitcoin removes the need for trusted intermediaries.",
  "The protocol is secured by cryptographic algorithms.",
  "The decentralized nature makes Bitcoin resilient to attacks.",
  "Bitcoin can help build a more open and fair financial system.",
  "The software and network protocols are open source.",
  "Bitcoin’s monetary supply is deflationary by design.",
  "The system is designed to be scalable and efficient.",
  "Bitcoin’s key innovation is the proof-of-work blockchain.",
  "Users can recover funds using seed phrases for wallet backup.",
  "The network validates transactions independently and transparently.",
  "Bitcoin can provide financial services to those without banks.",
  "The protocol supports custom scripts for complex transactions.",
  "Bitcoin is a global network that anyone can join.",
  "The system promotes financial privacy through pseudonymity.",
  "Nodes communicate over secure encrypted connections.",
  "Bitcoin’s architecture prevents double spending reliably.",
  "The community ensures the software remains secure and up-to-date.",
  "Bitcoin enables programmable money with smart contracts.",
  "The network incentivizes participation through rewards.",
  "Users can spend and receive Bitcoin without permission.",
  "Bitcoin’s ledger is immutable and publicly verifiable.",
  "The protocol uses elliptic curve cryptography for keys.",
  "Bitcoin is the foundation of a new financial era.",
  "The system is designed to be trustless and decentralized.",
  "Bitcoin transactions are irreversible and final once confirmed.",
  "I hope Bitcoin can give people more control over their money."
];

async function publishQuote() {
  try {
    const quote = SATOSHI_QUOTES[Math.floor(Math.random() * SATOSHI_QUOTES.length)];
    const event = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['t', 'satoshi-test']],
      content: `${quote} \n\n— Satoshi Nakamoto`,
      pubkey: publicKey
    };

    event.id = getEventHash(event);
    event.sig = getSignature(event, privateKey);

    await Promise.any(pool.publish(RELAYS, event));
    console.log(`[${new Date().toLocaleTimeString()}] ✅ Published: ${quote.substring(0, 40)}...`);
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ⚠️ Error: ${error.message}`);
  }
}

function startTestSchedule() {
  // Initial immediate post
  publishQuote();
  
  // Set up recurring posts every 28800 seconds
  const interval = setInterval(() => {
    publishQuote().catch(e => console.error('Interval error:', e));
  }, 28800 * 1000);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    console.log('🛑 Stopped test interval');
  };
}

function shutdown() {
  console.log('\n🔌 Closing relays...');
  pool.close(RELAYS);
  process.exit();
}

// Initialization
console.log(`\n🔑 Public key: ${nip19.npubEncode(publicKey)}`);
console.log('📡 Satoshi is Live: Posting every 8 hours\n');
const stopSchedule = startTestSchedule();

process.on('SIGINT', () => {
  stopSchedule();
  shutdown();
});