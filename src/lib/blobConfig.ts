import "server-only";

// This project's Blob store was provisioned with public access (needed
// for shareable brochure PDF links) — Vercel Blob doesn't allow mixing
// private and public access within one store, so the password and reset
// -token blobs have to use "public" access too. Their real protection is
// this namespace: a long random path segment nobody can guess, generated
// once and stored only in the server's own env vars. A public blob is
// still only reachable by someone who knows its exact URL — the store's
// origin alone (e.g. leaked via a shared brochure link) isn't enough to
// find "config/<namespace>/admin-password.txt" without also knowing the
// namespace.
export function blobSecretNamespace(): string {
  const namespace = process.env.BLOB_SECRET_PATH;
  if (!namespace) {
    throw new Error(
      "BLOB_SECRET_PATH is not set — required so the password/reset-token blobs live at an unguessable path.",
    );
  }
  return namespace;
}
