import { describe, expect, it } from "vitest";
import {
  generateVerificationToken,
  checkDnsTxt,
  checkWellKnownFile,
} from "./domainVerification";

describe("generateVerificationToken", () => {
  it("produces unique, prefixed tokens", () => {
    const a = generateVerificationToken();
    const b = generateVerificationToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^sepgate-verify-[a-f0-9]{32}$/);
  });
});

// Live checks against a real domain with no verification record for our
// token — exercises the real DNS/HTTP path and confirms it fails cleanly
// rather than throwing.
describe("checkDnsTxt", () => {
  it("reports not verified when no matching TXT record exists", async () => {
    const result = await checkDnsTxt("example.com", "not-a-real-token");
    expect(result.verified).toBe(false);
    expect(result.detail).toBeTruthy();
  });
});

describe("checkWellKnownFile", () => {
  it("reports not verified when the well-known file doesn't exist", async () => {
    const result = await checkWellKnownFile("example.com", "not-a-real-token");
    expect(result.verified).toBe(false);
    expect(result.detail).toBeTruthy();
  });
});
