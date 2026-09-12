"use server";

import { createResetToken } from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email";
import { siteUrl } from "@/lib/site";

// No email address is ever accepted from the visitor — the reset link
// always goes to the one fixed PASSWORD_RECOVERY_EMAIL, so this can't be
// used to send a reset link anywhere else.
export async function requestPasswordReset() {
  const token = await createResetToken();
  const resetUrl = `${siteUrl()}/reset-password?token=${token}`;
  await sendPasswordResetEmail(resetUrl);
}
