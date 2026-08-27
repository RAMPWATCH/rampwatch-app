import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { operatorFetch } from "@/lib/operatorApi";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session.userId) {
    redirect("/login");
  }

  try {
    const formData = await request.formData();
    const currentPassword = formData.get("currentPassword")?.toString();
    const newPassword = formData.get("newPassword")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return Response.json({ error: "all fields are required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return Response.json({ error: "password must be at least 8 characters" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return Response.json({ error: "passwords do not match" }, { status: 400 });
    }

    const response = await operatorFetch(
      "/operator/me/password",
      session,
      {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: response.data?.error || "failed to update password" },
        { status: response.status }
      );
    }

    redirect("/app/settings?success=password-updated");
  } catch (error) {
    console.error("[POST /app/settings/password]", error);
    return Response.json({ error: "failed to update password" }, { status: 500 });
  }
}
