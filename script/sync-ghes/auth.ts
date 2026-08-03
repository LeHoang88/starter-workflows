/**
 * Ensures the script has write credentials before it performs any
 * destructive git operations (checkout, rm -fr, push).
 */
export function validateSession(): void {
  const token = process.env.GITHUB_TOKEN;
  if (!token || token.trim().length === 0) {
    throw new Error(
      "GITHUB_TOKEN is not set. Syncing to the ghes branch requires write credentials."
    );
  }
}
