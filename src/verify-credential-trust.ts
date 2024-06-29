import axios from 'axios';
import { agent } from './veramo/setup.js'

export async function verifyCredential() {
  const result = await agent.verifyCredential({
    credential:
      {
        "credentialSubject": {
          "Name": "John Tester",
          "Adress": "Stuttgart",
          "Age": "25",
          "id": "did:ethr:goerli:0x03ce273a4c56bd237cc782eca09fb5e13884de529e7f464cc07a9ebea1132c77fd"
        },
        "issuer": {
          "id": "did:key:z6Mkpx4x56B4Y8afizXe3pBsNtQUwzQfJfV99ud9sesj2Xhx"
        },
        "type": [
          "VerifiableCredential"
        ],
        "termsOfUse": {
          "type": "member of a scheme",
          "trustScheme": [
            "hft.train.trust-scheme.de"
          ]
        },
        "@context": [
          "https://www.w3.org/2018/credentials/v1"
        ],
        "issuanceDate": "2024-06-29T17:02:50.000Z",
        "proof": {
          "type": "JwtProof2020",
          "jwt": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7Ik5hbWUiOiJKb2huIFRlc3RlciIsIkFkcmVzcyI6IlN0dXR0Z2FydCIsIkFnZSI6IjI1In0sInRlcm1zT2ZVc2UiOnsidHlwZSI6Im1lbWJlciBvZiBhIHNjaGVtZSIsInRydXN0U2NoZW1lIjpbImhmdC50cmFpbi50cnVzdC1zY2hlbWUuZGUiXX19LCJzdWIiOiJkaWQ6ZXRocjpnb2VybGk6MHgwM2NlMjczYTRjNTZiZDIzN2NjNzgyZWNhMDlmYjVlMTM4ODRkZTUyOWU3ZjQ2NGNjMDdhOWViZWExMTMyYzc3ZmQiLCJuYmYiOjE3MTk2ODA1NzAsImlzcyI6ImRpZDprZXk6ejZNa3B4NHg1NkI0WThhZml6WGUzcEJzTnRRVXd6UWZKZlY5OXVkOXNlc2oyWGh4In0.UwqKllPVcaQRnMU3JymZLp1QyJRseiguI9YkiRda8OAWacB6WWZnEJRoppWshsi_c9YOStQETBxzDmAajmRMBQ"
        }
      }
  })
  return result.verified;
}

export async function verifyCredentialTrust(issuer: string, trustSchemePointer: string) {
  const url = 'https://essif.trust-scheme.de/atvtrain/api/v1/ssi/';
  const payload = {
    "Issuer": issuer,
    "Trust_Scheme_Pointer": trustSchemePointer
  };

  try {
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error) {
    throw new Error('Trust verification failed');
  }
}

export async function verifyAndTrustCredential() {
  const verified = await verifyCredential();

  if (!verified) {
    throw new Error('Credential verification failed');
  }

  const issuer = "did:key:z6Mkpx4x56B4Y8afizXe3pBsNtQUwzQfJfV99ud9sesj2Xhx";
  const trustSchemePointer = 'hft.train.trust-scheme.de';

  const trustResponse = await verifyCredentialTrust(issuer, trustSchemePointer);

  if (trustResponse.VerificationStatus === 'OK') {
    console.log('Credential is trusted');
  } else {
    console.log(trustResponse);
    throw new Error('Credential is not trusted');
  }

  return {
    verified: true,
    trust: trustResponse
  };
}
