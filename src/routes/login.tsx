import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="relative grid min-h-screen place-items-center px-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/banner.jpg')] bg-cover bg-center"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-bg/80" aria-hidden="true" />
      <div className="relative w-full max-w-sm space-y-5 rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
        <div className="space-y-1">
          <p className="font-display text-sm tracking-[0.18em] uppercase text-coin">antbit</p>
          <h1 className="text-xl font-medium text-fg">Sign in</h1>
          <p className="text-sm text-muted">Continue with Google or X.</p>
        </div>
        {authEnabled ? (
          GROK_PROVIDERS.map((provider) => (
            <Button
              key={provider.providerId}
              type="button"
              className="w-full"
              onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
            >
              Continue with {provider.label}
            </Button>
          ))
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        )}
        <Button asChild variant="ghost" className="w-full">
          <Link to="/">Back to desk</Link>
        </Button>
      </div>
    </main>
  );
}
