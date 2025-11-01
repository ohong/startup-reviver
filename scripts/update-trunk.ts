/* Example: update SIP outbound trunk fields */
import { ListUpdate } from '@livekit/protocol';
import { SipClient } from 'livekit-server-sdk';

// Try to load .env if dotenv is available
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch {}

async function main() {
  const livekitUrl = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const trunkId = process.env.LIVEKIT_SIP_OUTBOUND_TRUNK_ID;

  if (!livekitUrl || !apiKey || !apiSecret || !trunkId) {
    throw new Error('Missing LIVEKIT_* env vars or trunk ID');
  }

  const sip = new SipClient(livekitUrl, apiKey, apiSecret);

  // Example updates: change name/address and add/remove numbers
  const updated = await sip.updateSipOutboundTrunkFields(trunkId, {
    name: 'My updated trunk',
    // Example address for a SIP provider (replace with yours)
    // If you need to change transport or auth, use updateSipOutboundTrunk instead.
    allowedNumbers: new ListUpdate({ add: ['+15220501011'], remove: ['+15105550100'] }),
    // destinationCountry: 'US',
    // authUsername: 'user',
    // authPassword: 'pass',
  });

  console.log('Updated trunk:', updated);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
