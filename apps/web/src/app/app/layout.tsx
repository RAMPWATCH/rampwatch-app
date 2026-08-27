import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Operator Dashboard",
};

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session.userId) {
    redirect("/login");
  }

  return <>{children}</>;
}
