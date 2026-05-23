import { redirect } from "next/navigation";
import { getFirstAllowedPath } from "@/lib/permissions";
import { getSessionUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getSessionUser();
  redirect(user ? await getFirstAllowedPath(user) : "/login");
}
