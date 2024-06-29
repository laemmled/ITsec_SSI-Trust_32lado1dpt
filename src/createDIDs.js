// Importieren des Agents aus dem Setup
import { agent } from './veramo/setup.js';

async function createDIDs() {
  try {
    // Generate DID:key
    const didKey = await agent.didManagerCreate({ provider: 'did:key' });
    console.log('DID:key:', didKey);

    // Generate DID:ethr:goerli
    const didGoerli = await agent.didManagerCreate({ provider: 'did:ethr:goerli' });
    console.log('DID:ethr:goerli:', didGoerli);
  } catch (error) {
    console.error('Error creating DIDs:', error);
  }
}

createDIDs();
