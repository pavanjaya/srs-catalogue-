"use server";

import { verifyResetToken, clearResetToken } from "@/lib/passwordReset";
import { setAdminPassword } from "@/lib/adminPassword";
import { redirect } from "next/navigation";

export type ResetPasswordState = { error?: string };

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = formData.get("token");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof token !== "string" || !(await verifyResetToken(token))) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return { error: "New password must be at least 6 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords don't match." };
  }

  await setAdminPassword(newPassword);
  await clearResetToken();
  redirect("/login?reset=success");
}
