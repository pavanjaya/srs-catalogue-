"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminPassword, setAdminPassword } from "@/lib/adminPassword";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("srs_admin_session");
  redirect("/login");
}

export type ChangePasswordState = { error?: string; success?: boolean };

// Lets the studio change their own login password without ever needing a
// developer to touch an env var. The session cookie is intentionally left
// alone here — it's signed against the fixed ADMIN_PASSWORD env var, not
// against this changeable password, so updating the password never logs
// the current session out.
export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return { error: "New password must be at least 6 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords don't match." };
  }
  if (currentPassword !== (await getAdminPassword())) {
    return { error: "Current password is incorrect." };
  }

  await setAdminPassword(newPassword);
  return { success: true };
}
