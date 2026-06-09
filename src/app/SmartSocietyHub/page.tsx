import { getSession } from "@/lib/auth";
import { getDefaultRoute } from "@/lib/role-access";
import { redirect } from "next/navigation";

export default async function SmartSocietyHubRedirectPage() {
  const session = await getSession();
  redirect(session ? getDefaultRoute(session.role) : "/login");
}
