import { promises as dns } from "node:dns";
import { fetchText } from "../checks/http";

export const VERIFICATION_TXT_PREFIX = "_sepgate-verify";
export const VERIFICATION_WELL_KNOWN_PATH = "/.well-known/sepgate-verify.txt";

export function generateVerificationToken(): string {
  return `sepgate-verify-${crypto.randomUUID().replace(/-/g, "")}`;
}

export interface VerificationCheckResult {
  verified: boolean;
  detail: string;
}

/** Looks for `token` in a TXT record at _sepgate-verify.<domain>. Never throws. */
export async function checkDnsTxt(
  domain: string,
  token: string,
): Promise<VerificationCheckResult> {
  const host = `${VERIFICATION_TXT_PREFIX}.${domain}`;
  try {
    const records = await dns.resolveTxt(host);
    const found = records.some((chunks) => chunks.join("").trim() === token);
    return found
      ? { verified: true, detail: `matching TXT record found at ${host}` }
      : { verified: false, detail: `no matching TXT record at ${host}` };
  } catch (error) {
    return {
      verified: false,
      detail: `DNS lookup failed for ${host}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/** Looks for `token` as the exact content of https://<domain>/.well-known/sepgate-verify.txt. */
export async function checkWellKnownFile(
  domain: string,
  token: string,
): Promise<VerificationCheckResult> {
  const url = `https://${domain}${VERIFICATION_WELL_KNOWN_PATH}`;
  const fetched = await fetchText(url, { retries: 2 });
  if (!fetched.ok) {
    return { verified: false, detail: `could not fetch ${url}: ${fetched.errorDetail}` };
  }
  const found = fetched.text.trim() === token;
  return found
    ? { verified: true, detail: `matching file found at ${url}` }
    : { verified: false, detail: `${url} did not contain the expected token` };
}
