/** Nitro middleware hook. Pass-through on Vercel / custom domains. */
export default async function grokPwaMiddleware(
  _event: unknown,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  return next();
}
