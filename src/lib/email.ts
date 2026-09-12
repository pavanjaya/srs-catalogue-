import "server-only";

// Placeholder mailer — the "Forgot password" flow is built end-to-end
// against this function, but no email provider is wired up yet. Until
// then, the reset link is only visible in the server logs, so use it
// there to test the flow. Swap the body for a real Resend call
// (`resend.emails.send(...)`) when that's set up — nothing else in the
// reset flow needs to change.
export async function sendPasswordResetEmail(resetUrl: string): Promise<void> {
  const to = process.env.PASSWORD_RECOVERY_EMAIL;
  console.log(
    `[email:not-yet-configured] Password reset requested. Would send to ${to ?? "(PASSWORD_RECOVERY_EMAIL not set)"}:\n${resetUrl}`,
  );
}
