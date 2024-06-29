// Core interfaces
import {
  createAgent,
  IDIDManager,
  IResolver,
  IDataStore,
  IKeyManager,
  ICredentialPlugin,
} from "@veramo/core";

// Core identity manager plugin
import { DIDManager } from "@veramo/did-manager";

// Ethr did identity provider
import { EthrDIDProvider } from "@veramo/did-provider-ethr";

// Web did identity provider
import { WebDIDProvider } from "@veramo/did-provider-web";

import { KeyDIDProvider, getDidKeyResolver } from "@veramo/did-provider-key";

// Core key manager plugin
import { KeyManager } from "@veramo/key-manager";

// Custom key management system for RN
import { KeyManagementSystem, SecretBox } from "@veramo/kms-local";

// W3C Verifiable Credential plugin
import { CredentialPlugin } from "@veramo/credential-w3c";

// Custom resolvers
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { Resolver } from "did-resolver";
import { getResolver as ethrDidResolver } from "ethr-did-resolver";
import { getResolver as webDidResolver } from "web-did-resolver";

import {
  CredentialIssuerLD,
  VeramoEd25519Signature2018,
  VeramoEcdsaSecp256k1RecoverySignature2020,
} from "@veramo/credential-ld";
import * as fs from "fs";
import * as path from "path";

// Storage plugin using TypeOrm
import {
  Entities,
  KeyStore,
  DIDStore,
  IDataStoreORM,
  PrivateKeyStore,
  migrations,
} from "@veramo/data-store";

// TypeORM is installed with `@veramo/data-store`
import { DataSource } from "typeorm";
import { LdDefaultContexts } from "@veramo/credential-ld";
import { isUtf8 } from "buffer";
import { fileURLToPath } from "url";

// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = "database.sqlite";

// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = 'ce49ee4dbff140448fd4ab4d98694680'

// This will be the secret key for the KMS
const KMS_SECRET_KEY =
  "11b574d316903ced6cc3f4787bbcc3047d9c72d1da4d83e36fe714ef785d10c1";

const dbConnection = new DataSource({
  type: "sqlite",
  database: DATABASE_FILE,
  synchronize: false,
  migrations,
  migrationsRun: true,
  logging: ["error", "info", "warn"],
  entities: Entities,
}).initialize();

async function read(path1: string) {
  const __filename = fileURLToPath(import.meta.url);

  const __dirname = path.dirname(__filename);
  //console.log(__dirname)
  const contextDefinition = fs.readFileSync(
    path.resolve(__dirname, "./contexts/" + path1),
    "utf8"
  );
  //console.log(contextDefinition)
  return JSON.parse(contextDefinition);
}
export const agent = createAgent<
  IDIDManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IResolver &
  ICredentialPlugin
>({
  plugins: [
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(
          new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))
        ),
      },
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: "did:key",
      providers: {
        "did:ethr:goerli": new EthrDIDProvider({
          defaultKms: "local",
          network: "goerli",
          rpcUrl: "https://goerli.infura.io/v3/" + INFURA_PROJECT_ID,
        }),
        "did:web": new WebDIDProvider({
          defaultKms: "local",
        }),

        "did:key": new KeyDIDProvider({ defaultKms: "local" }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...webDidResolver(),
        ...getDidKeyResolver(),
      }),
    }),
    new CredentialPlugin(),

    new CredentialIssuerLD({
      /*contextMaps: [LdDefaultContexts, extraContexts], */
      contextMaps: [
        new Map([
          [
            "https://www.w3.org/2018/credentials/v1",
            await read("w3_2018_credentials_v1")
          ],
          [
            "https://w3id.org/security/suites/ed25519-2018/v1",
            await read("EcdsaSecp256k1RecoverySignature2020.jsonld")
          ],
          [
            "https://raw.githubusercontent.com/Open-Credentialing-Initiative/schemas/main/credentials/draft/IdentityCredential-v2.0.0.jsonld",
            await read("IdentityCredential-v2.0.0.jsonld")
          ],
          [
            "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld",
            await read("EcdsaSecp256k1RecoverySignature2020.jsonld")
          ],
        ]),
      ],
      suites: [
        new VeramoEd25519Signature2018(),
        new VeramoEcdsaSecp256k1RecoverySignature2020(),
      ],
    }),
  ],
});
