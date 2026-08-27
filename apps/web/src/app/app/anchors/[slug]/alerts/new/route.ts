import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { operatorFetch } from "@/lib/operatorApi";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSession();

  if (!session.userId) {
    redirect("/login");
  }

  try {
    const formData = await request.formData();
    const channel = formData.get("channel")?.toString();
    const destination = formData.get("destination")?.toString();

    if (!channel || !destination) {
      return Response.json({ error: "channel and destination are required" }, { status: 400 });
    }

    if (!["email", "webhook"].includes(channel)) {
      return Response.json({ error: "channel must be 'email' or 'webhook'" }, { status: 400 });
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
      return Response.json(
        { error: response.data?.error || "failed to create alert" },
        { status: response.status }
      );
    }

    redirect(`/app/anchors/${slug}/alerts`);
  } catch (error) {
    console.error("[POST /app/anchors/:slug/alerts/new]", error);
    return Response.json({ error: "failed to create alert" }, { status: 500 });
  }
}
