import { getDb } from "../db/client";

/**
 * Contract event listener service
 * Mirrors Soroban contract events to PostgreSQL tables
 *
 * Events handled:
 * - Deposited -> escrow_accounts
 * - UsageRecorded -> usage_receipts
 * - Settled -> updates escrow_accounts status
 * - DisputeRaised -> disputes
 */

export interface ContractEvent {
  type: "Deposited" | "UsageRecorded" | "Settled" | "DisputeRaised";
  data: Record<string, any>;
  timestamp: number;
}

export async function handleDepositedEvent(event: ContractEvent, db: any) {
  const { escrow_id, buyer, provider, amount, balance_after } = event.data;

  await db.insert("escrow_accounts").values({
    id: `escrow_${escrow_id}`,
    contractEscrowId: escrow_id,
    buyerAddress: buyer,
    providerId: provider, // Will be joined with providers table
    balance: balance_after,
    createdAt: new Date(event.timestamp * 1000),
  });
}

export async function handleUsageRecordedEvent(event: ContractEvent, db: any) {
  const { escrow_id, units, balance_after } = event.data;

  // Update escrow balance
  await db.update("escrow_accounts")
    .set({ balance: balance_after })
    .where({ contractEscrowId: escrow_id });

  // Record usage receipt
  await db.insert("usage_receipts").values({
    escrowAccountId: `escrow_${escrow_id}`,
    units: units,
    status: "recorded",
    createdAt: new Date(event.timestamp * 1000),
  });
}

export async function handleSettledEvent(event: ContractEvent, db: any) {
  const { escrow_id, provider, amount } = event.data;

  // Mark escrow as settled
  await db.update("escrow_accounts")
    .set({
      status: "settled",
      totalReleased: amount,
    })
    .where({ contractEscrowId: escrow_id });
}

export async function handleDisputeRaisedEvent(event: ContractEvent, db: any) {
  const { escrow_id, raised_by, reason_code } = event.data;

  // Create dispute record
  await db.insert("disputes").values({
    escrowAccountId: `escrow_${escrow_id}`,
    raisedBy: raised_by,
    reasonCode: reason_code,
    status: "open",
    createdAt: new Date(event.timestamp * 1000),
  });

  // Mark escrow as having dispute
  await db.update("escrow_accounts")
    .set({ status: "disputed" })
    .where({ contractEscrowId: escrow_id });
}

export async function processContractEvent(event: ContractEvent) {
  const db = await getDb();

  try {
    switch (event.type) {
      case "Deposited":
        await handleDepositedEvent(event, db);
        break;
      case "UsageRecorded":
        await handleUsageRecordedEvent(event, db);
        break;
      case "Settled":
        await handleSettledEvent(event, db);
        break;
      case "DisputeRaised":
        await handleDisputeRaisedEvent(event, db);
        break;
    }
    console.log(`[contract-listener] Processed ${event.type} event`);
  } catch (error) {
    console.error(`[contract-listener] Failed to process event:`, error);
    throw error;
  }
}

/**
 * Start listening for contract events (would integrate with Soroban RPC)
 * This is a stub - real implementation would connect to Soroban RPC
 */
export function startContractListener() {
  console.log("[contract-listener] Starting Soroban contract event listener");
  // TODO: Connect to Soroban RPC event stream
  // TODO: Filter for SEPGATE contract events
  // TODO: Process and mirror to database
}
