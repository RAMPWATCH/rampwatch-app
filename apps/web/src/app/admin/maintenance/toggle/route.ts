import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { adminFetch } from "@/lib/adminApi";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session.userId) {
    redirect("/login");
  }

  try {
    const formData = await request.formData();
    const maintenance = formData.get("maintenance")?.toString() === "true";

    const response = await adminFetch(
      "/api/v1/admin/settings/maintenance",
      session,
      {
        method: "PATCH",
        body: JSON.stringify({ maintenanceMode: maintenance }),
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: response.error || "failed to toggle maintenance mode" },
        { status: response.status }
      );
    }

    redirect("/admin/maintenance");
  } catch (error) {
    console.error("[POST /admin/maintenance/toggle]", error);
    return Response.json({ error: "failed to toggle maintenance mode" }, { status: 500 });
  }
}
