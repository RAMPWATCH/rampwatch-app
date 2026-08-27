import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { adminFetch } from "@/lib/adminApi";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session.userId) {
    redirect("/login");
  }

  try {
    const response = await adminFetch(
      "/api/v1/admin/scheduler/run",
      session,
      { method: "POST" }
    );

    if (!response.ok) {
      return Response.json(
        { error: response.error || "failed to run scheduler" },
        { status: response.status }
      );
    }

    redirect("/admin/maintenance?success=scheduler-queued");
  } catch (error) {
    console.error("[POST /admin/maintenance/run-scheduler]", error);
    return Response.json({ error: "failed to run scheduler" }, { status: 500 });
  }
}
