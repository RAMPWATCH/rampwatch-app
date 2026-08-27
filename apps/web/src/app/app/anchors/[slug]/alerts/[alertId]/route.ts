import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { operatorFetch } from "@/lib/operatorApi";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; alertId: string }> }
) {
  const { slug, alertId } = await params;
  const session = await getSession();

  if (!session.userId) {
    redirect("/login");
  }

  try {
    const formData = await request.formData();
    const method = formData.get("_method")?.toString();

    if (method === "DELETE") {
      const response = await operatorFetch(
        `/operator/anchors/${slug}/alerts/${alertId}`,
        session,
        { method: "DELETE" }
      );

      if (!response.ok) {
        return Response.json(
          { error: response.data?.error || "failed to delete alert" },
          { status: response.status }
        );
      }

      redirect(`/app/anchors/${slug}/alerts`);
    }

    return Response.json({ error: "method not allowed" }, { status: 405 });
  } catch (error) {
    console.error("[POST /app/anchors/:slug/alerts/:alertId]", error);
    return Response.json({ error: "failed to process request" }, { status: 500 });
  }
}
