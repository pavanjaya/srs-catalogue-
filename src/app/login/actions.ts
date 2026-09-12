"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminPassword } from "@/lib/adminPassword";

export async function adminLogin(formData: FormData) {
  const password = formData.get("password");
  const next = (formData.get("next") as string) || "/";

  if (!process.env.ADMIN_PASSWORD || password !== (await getAdminPassword())) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=1`);
  }

  const cookieStore = await cookies();
  cookieStore.set("srs_admin_session", process.env.ADMIN_PASSWORD, {
    httpOnly: true,
    // A Secure cookie is dropped/ignored on plain http:// origins (e.g.
    // local dev at http://localhost) by spec — only mark it Secure where
    // the site is actually served over HTTPS (production).
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(next);
}
