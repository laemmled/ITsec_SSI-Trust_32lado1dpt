import { verifyAndTrustCredential } from './verify-credential-trust.js';

async function main() {
  try {
    const result = await verifyAndTrustCredential();
    console.log('Credential verified and trusted:', result);
  } catch (error) {
    console.error('Verification error:', error);
  }
}

main();
