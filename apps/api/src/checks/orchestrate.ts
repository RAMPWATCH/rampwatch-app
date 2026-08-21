import { Networks } from "@stellar/stellar-sdk";
import { checkSep1 } from "./toml";
import { checkSep10 } from "./sep10";
import { checkSep6 } from "./sep6";
import { checkSep24 } from "./sep24";
import { checkSep38 } from "./sep38";
import { aggregateStatus } from "./aggregate";
import type { FetchTextOptions } from "./http";
import type { SepCheckOutcome } from "./types";
import type { CheckStatus, Network } from "../db/schema";

export interface CheckRunResult {
  domain: string;
  status: CheckStatus;
  startedAt: Date;
  completedAt: Date;
  outcomes: SepCheckOutcome[];
}

function networkPassphraseFor(network: Network): string {
  return network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
}

/**
 * Runs every SEP check an anchor's stellar.toml actually declares support
 * for, in order, and derives the overall status. Each checker already
 * never throws (see http.ts), so a single anchor's checks can never crash
 * the caller — this is what lets the scheduler run one anchor's failure
 * without taking down the rest of the batch.
 */
export async function runCheckForDomain(
  domain: string,
  network: Network,
  options?: FetchTextOptions,
): Promise<CheckRunResult> {
  const startedAt = new Date();
  const outcomes: SepCheckOutcome[] = [];

  const sep1 = await checkSep1(domain, options);
  outcomes.push(sep1.outcome);

  if (sep1.outcome.passed) {
    const passphrase = sep1.endpoints.networkPassphrase ?? networkPassphraseFor(network);

    if (sep1.endpoints.webAuthEndpoint) {
      outcomes.push(await checkSep10(domain, sep1.endpoints, passphrase, options));
    }
    if (sep1.endpoints.transferServerSep6) {
      outcomes.push(await checkSep6(sep1.endpoints, options));
    }
    if (sep1.endpoints.transferServerSep24) {
      outcomes.push(await checkSep24(sep1.endpoints, options));
    }
    if (sep1.endpoints.anchorQuoteServer) {
      outcomes.push(await checkSep38(sep1.endpoints, options));
    }
  }

  return {
    domain,
    status: aggregateStatus(outcomes),
    startedAt,
    completedAt: new Date(),
    outcomes,
  };
}
