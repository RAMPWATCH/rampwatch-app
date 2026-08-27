"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";
import { operatorFetch } from "@/lib/operatorApi";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

interface ClaimStartResponse {
  anchor: { id: string; slug: string; domain: string };
  verification: { id: string; token: string; method: "dns_txt" | "well_known_file" };
}

interface VerifyResponse {
  verified: boolean;
  detail: string;
  anchor?: { id: string; slug: string; domain: string };
}

export default function ClaimAnchorPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [domain, setDomain] = useState("");
  const [network, setNetwork] = useState<"mainnet" | "testnet">("mainnet");
  const [method, setMethod] = useState<"dns_txt" | "well_known_file">("dns_txt");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<ClaimStartResponse | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleStartClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await getSession();
      const result = await operatorFetch<ClaimStartResponse>(
        "/operator/anchors/claim",
        session,
        {
          method: "POST",
          body: JSON.stringify({ domain, network, method }),
        }
      );

      if (!result.ok) {
        setError(result.error || "Failed to start claim");
        return;
      }

      setVerificationData(result.data);
      setStep("verify");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationData) return;
    setVerifyError(null);
    setVerifying(true);

    try {
      const session = await getSession();
      const result = await operatorFetch<VerifyResponse>(
        `/operator/anchors/${verificationData.anchor.slug}/verify`,
        session,
        { method: "POST" }
      );

      if (!result.ok) {
        setVerifyError(result.error || "Verification failed");
        return;
      }

      if (result.data?.verified) {
        router.push(`/app/anchors/${verificationData.anchor.slug}`);
      } else {
        setVerifyError(result.data?.detail || "Domain verification failed");
      }
    } catch (err) {
      setVerifyError(
        err instanceof Error ? err.message : "Verification check failed"
      );
    } finally {
      setVerifying(false);
    }
  };

  if (step === "form") {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Link href="/app" className="text-accent-primary hover:underline">
            ← Back to Dashboard
          </Link>

          <div className="mt-8">
            <h1 className="font-display text-3xl font-bold">Claim Your Anchor</h1>
            <p className="mt-2 text-text-secondary">
              Enter your anchor domain and choose a verification method
            </p>
          </div>

          <Card className="mt-8">
            <form onSubmit={handleStartClaim} className="space-y-6">
              {error && (
                <div className="rounded-md border border-status-down bg-bg-secondary p-4 text-status-down">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-primary">
                  Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  className="mt-2 w-full rounded-md border border-border-subtle bg-bg-secondary px-4 py-2 text-text-primary placeholder-text-tertiary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary">
                  Network
                </label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value as "mainnet" | "testnet")}
                  className="mt-2 w-full rounded-md border border-border-subtle bg-bg-secondary px-4 py-2 text-text-primary"
                >
                  <option value="mainnet">Mainnet</option>
                  <option value="testnet">Testnet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary">
                  Verification Method
                </label>
                <div className="mt-3 space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="dns_txt"
                      checked={method === "dns_txt"}
                      onChange={(e) => setMethod(e.target.value as "dns_txt" | "well_known_file")}
                      className="mr-3"
                    />
                    <span className="text-text-primary">
                      DNS TXT Record (Recommended)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="well_known_file"
                      checked={method === "well_known_file"}
                      onChange={(e) => setMethod(e.target.value as "dns_txt" | "well_known_file")}
                      className="mr-3"
                    />
                    <span className="text-text-primary">
                      .well-known File
                    </span>
                  </label>
                </div>
              </div>

              <Button variant="primary" disabled={loading}>
                {loading ? "Starting..." : "Start Claim"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/app" className="text-accent-primary hover:underline">
          ← Back to Dashboard
        </Link>

        <div className="mt-8">
          <h1 className="font-display text-3xl font-bold">Verify Domain Ownership</h1>
          <p className="mt-2 text-text-secondary">
            {verificationData?.verification.method === "dns_txt"
              ? "Add a DNS TXT record to verify ownership"
              : "Add a file to your .well-known directory to verify ownership"}
          </p>
        </div>

        <Card className="mt-8">
          {verifyError && (
            <div className="mb-6 rounded-md border border-status-down bg-bg-secondary p-4 text-status-down">
              {verifyError}
            </div>
          )}

          <div className="space-y-6">
            {verificationData && (
              <>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {verificationData.verification.method === "dns_txt"
                      ? "DNS TXT Record"
                      : "Well-Known File"}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    {verificationData.verification.method === "dns_txt"
                      ? `Add a TXT record at _sepgate-verify.${verificationData.anchor.domain}`
                      : `Create a file at https://${verificationData.anchor.domain}/.well-known/sepgate-verify.txt`}
                  </p>
                </div>

                <div className="rounded-md bg-bg-secondary p-4">
                  <p className="text-xs text-text-tertiary">Token:</p>
                  <code className="break-all font-mono text-text-primary">
                    {verificationData.verification.token}
                  </code>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleVerify}
                    disabled={verifying}
                  >
                    {verifying ? "Verifying..." : "Verify"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setStep("form")}
                    disabled={verifying}
                  >
                    Back
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
