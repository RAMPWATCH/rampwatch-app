import type { CheckStatus } from "../db/schema/checkRuns";
import type { SepCheckOutcome } from "./types";

/**
 * Derives a check_run's overall status from the sep_check_results produced
 * for it. Callers only pass outcomes for SEPs the anchor actually declares
 * in its stellar.toml (an anchor not implementing SEP-6, say, isn't a
 * failure — it's simply not checked), so every outcome here represents a
 * SEP the anchor claims to support.
 *
 * - sep1 failing means nothing else could be reliably discovered: down.
 * - every declared SEP passing: operational.
 * - every declared SEP failing: down.
 * - a mix of passing and failing: degraded.
 */
export function aggregateStatus(outcomes: SepCheckOutcome[]): CheckStatus {
  if (outcomes.length === 0) {
    return "down";
  }

  const sep1 = outcomes.find((outcome) => outcome.sepType === "sep1");
  if (sep1 && !sep1.passed) {
    return "down";
  }

  // sep1 is a prerequisite gate, not one of the "functional" SEPs the
  // anchor is being scored on — exclude it from the pass ratio below.
  const others = outcomes.filter((outcome) => outcome.sepType !== "sep1");
  if (others.length === 0) {
    return "operational";
  }

  const passedCount = others.filter((outcome) => outcome.passed).length;
  if (passedCount === others.length) {
    return "operational";
  }
  if (passedCount === 0) {
    return "down";
  }
  return "degraded";
}
