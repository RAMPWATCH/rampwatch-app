import { Keypair, TransactionBuilder, Networks, StrKey } from "@stellar/stellar-sdk";

const SERVER_SIGNING_KEY = process.env.STELLAR_SERVER_KEY || Keypair.random().publicKey();
const NETWORK_PASSPHRASE = Networks.TESTNET_NETWORK_PASSPHRASE;
const CHALLENGE_TIMEOUT_SECS = 300; // 5 minutes

export interface Sep10Challenge {
  transaction: string;
  network_passphrase: string;
}

export interface Sep10Verification {
  verified: boolean;
  address: string;
}

/**
 * Issue a SEP-10 authentication challenge
 */
export async function issueSep10Challenge(clientPublicKey: string): Promise<Sep10Challenge> {
  // Validate the public key format
  if (!StrKey.isValidEd25519PublicKey(clientPublicKey)) {
    throw new Error("invalid public key format");
  }

  const serverKeypair = Keypair.fromPublicKey(SERVER_SIGNING_KEY);

  // Create challenge transaction
  const account = { accountId: serverKeypair.publicKey(), sequenceNumber: "0" };
  const transaction = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
    timebounds: {
      minTime: Math.floor(Date.now() / 1000),
      maxTime: Math.floor(Date.now() / 1000) + CHALLENGE_TIMEOUT_SECS,
    },
  })
    .addOperation({
      destination: clientPublicKey,
      type: "manage_data",
      name: "sep-10 auth",
      value: Buffer.from(Math.random().toString()).toString("base64"),
    } as any)
    .setTimeout(0)
    .build();

  // Sign with server key
  transaction.sign(serverKeypair);

  return {
    transaction: transaction.toXDR(),
    network_passphrase: NETWORK_PASSPHRASE,
  };
}

/**
 * Verify a SEP-10 authentication challenge response
 */
export async function verifySep10Challenge(transactionXdr: string): Promise<Sep10Verification> {
  try {
    // In a real implementation, you would:
    // 1. Parse the transaction XDR
    // 2. Verify the server signature is present
    // 3. Verify the client signature is present
    // 4. Extract the client public key from the manage_data operation

    // For now, this is a placeholder that would be filled in with real Sep10 verification
    // The actual implementation would use Stellar SDK to parse and verify

    // This would extract the client public key from the transaction
    const clientPublicKey = "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

    return {
      verified: true,
      address: clientPublicKey,
    };
  } catch (error) {
    return {
      verified: false,
      address: "",
    };
  }
}
