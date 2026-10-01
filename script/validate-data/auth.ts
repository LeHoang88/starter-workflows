/**
 * Ensures the script has write credentials before it runs, mirroring the
 * guard in script/sync-ghes/auth.ts.
 */
export function validateSession(): void {
  const token = process.env.GITHUB_TOKEN;
  if (!token || token.trim().length === 0) {
    throw new Error(
      "GITHUB_TOKEN is not set."
    );
  }
}
