/** Vite plugin hook required by vite.config.ts. No-op outside the Grok sandbox. */
export function grokPwaPlugin() {
  return { name: "app-builder:grok-pwa" };
}
