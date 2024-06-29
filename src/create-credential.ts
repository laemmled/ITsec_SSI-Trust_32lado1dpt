import { W3CVerifiableCredential } from '@veramo/core';
import {agent} from './veramo/setup.js';

async function createVerifiableCredential() {
  const identifier = await agent.didManagerGetByAlias({alias: 'default'});

  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: {id: identifier.did},
      credentialSubject: {
        id: 'did:ethr:goerli:0x03ce273a4c56bd237cc782eca09fb5e13884de529e7f464cc07a9ebea1132c77fd',
        Name: 'John Tester',
        Adress: 'Stuttgart',
        Age: '25'
      },
      type: ['VerifiableCredential'],
      termsOfUse: {
        type: 'member of a scheme',
        trustScheme: ['hft.train.trust-scheme.de'],
      },
      '@context': ['https://www.w3.org/2018/credentials/v1'],
    },
    proofFormat: 'jwt',
  });

  console.log('New credential created:');
  console.log(JSON.stringify(verifiableCredential, null, 2));

  return verifiableCredential;
}

async function createVerifiablePresentation(verifiableCredential: W3CVerifiableCredential) {
  const identifier = await agent.didManagerGetByAlias({ alias: 'default' });

  const verifiablePresentation = await agent.createVerifiablePresentation({
    presentation: {
      holder: identifier.did,
      verifiableCredential: [verifiableCredential],
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      termsOfUse: {
        type: 'member of a scheme',
        trustScheme: ['hft.train.trust-scheme.de'],
      },
    },
    proofFormat: 'jwt',
  });

  console.log('New presentation created:');
  console.log(JSON.stringify(verifiablePresentation, null, 2));

  return verifiablePresentation;
}

async function main() {
  try {
    const verifiableCredential = await createVerifiableCredential();
    await createVerifiablePresentation(verifiableCredential);
  } catch (error) {
    console.error(error);
  }
}

main();
