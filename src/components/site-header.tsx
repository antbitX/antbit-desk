import { Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const NAV = [
  { href: "#about", label: "About" },
  { href: "#markets", label: "Markets" },
  { href: "#network", label: "Network" },
  { href: "#resources", label: "Resources" },
];

export function SiteHeader() {
  const { user, isPending } = useCurrentUserState();

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#about" className="flex items-center gap-2.5 text-fg">
          <img
            src="/avatar.jpg"
            alt=""
            className="size-8 rounded-full object-cover outline outline-1 -outline-offset-1 outline-coin/40"
            onError={(event) => {
              event.currentTarget.src = "/avatar.svg";
            }}
          />
          <span className="font-display text-sm tracking-[0.18em] uppercase">antbit</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex h-11 items-center rounded-md px-3 text-sm text-muted transition-colors duration-150 hover:text-fg"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex min-w-24 justify-end">
          {isPending ? (
            <Skeleton className="h-8 w-24 rounded-full" />
          ) : user ? (
            <SignedIn>
              <UserButton />
            </SignedIn>
          ) : (
            <SignedOut>
              <Button asChild size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
            </SignedOut>
          )}
        </div>
      </div>
    </header>
  );
}
