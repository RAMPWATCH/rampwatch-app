"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { operatorFetch } from "@/lib/operatorApi";

export async function createAlert(
  slug: string,
  formData: FormData
) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  const channel = formData.get("channel")?.toString();
  const destination = formData.get("destination")?.toString();

  if (!channel || !destination) {
    throw new Error("channel and destination are required");
  }

  if (!["email", "webhook"].includes(channel)) {
    throw new Error("channel must be 'email' or 'webhook'");
  }

  if (channel === "email" && !destination.includes("@")) {
    throw new Error("please enter a valid email address");
  }

  if (channel === "webhook" && !destination.startsWith("http")) {
    throw new Error("webhook URL must start with http:// or https://");
  }

  const response = await operatorFetch(
    `/operator/anchors/${slug}/alerts`,
    session,
    {
      method: "POST",
      body: JSON.stringify({ channel, destination }),
    }
  );

  if (!response.ok) {
    throw new Error(response.data?.error || "failed to create alert");
  }

  redirect(`/app/anchors/${slug}/alerts`);
}

export async function deleteAlert(slug: string, alertId: string) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  const response = await operatorFetch(
    `/operator/anchors/${slug}/alerts/${alertId}`,
    session,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw new Error(response.data?.error || "failed to delete alert");
  }

  redirect(`/app/anchors/${slug}/alerts`);
}
