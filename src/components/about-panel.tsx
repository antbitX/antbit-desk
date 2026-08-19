import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XIcon } from "@/components/x-icon";

export function AboutPanel() {
  return (
    <section id="about" className="scroll-mt-24">
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="stack">Stack</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <article className="rounded-xl bg-surface/90 p-6 shadow-[var(--shadow-border)] sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <img
                src="/avatar.jpg"
                alt="antbit avatar — Antoninus Pius gold denarius"
                className="size-24 shrink-0 rounded-full object-cover outline outline-1 -outline-offset-1 outline-coin/50 sm:size-28"
                onError={(event) => {
                  event.currentTarget.src = "/avatar.svg";
                }}
              />
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-4xl font-medium tracking-tight text-fg sm:text-5xl">
                    antbit
                  </h1>
                  <a
                    href="https://x.com/antbit"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex size-11 items-center justify-center rounded-md bg-tab text-tab-fg transition-colors duration-150 hover:bg-accent"
                    aria-label="Open @antbit on X"
                  >
                    <XIcon className="size-4" />
                  </a>
                </div>
                <p className="text-lg text-muted">
                  <a
                    href="https://x.com/antbit"
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    @antbit
                  </a>
                  <span className="mx-2 text-subtle">·</span>
                  bitcoin only
                </p>
                <p className="max-w-xl text-sm leading-relaxed text-muted">
                  Bitcoin-only desk. Watching price, issuance, and the node split —
                  Core, Knots, and RDTS (BIP-110).
                </p>
              </div>
            </div>
          </article>
        </TabsContent>

        <TabsContent value="stack">
          <article className="rounded-xl bg-surface/90 p-6 shadow-[var(--shadow-border)] sm:p-8">
            <ul className="grid gap-4 sm:grid-cols-3">
              <li>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  Hardware
                </p>
                <p className="mt-1 text-fg">SeedSigner</p>
              </li>
              <li>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  Desktop
                </p>
                <p className="mt-1 text-fg">Sparrow Wallet</p>
              </li>
              <li>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  Consensus
                </p>
                <p className="mt-1 text-fg">BIP-110 / RDTS</p>
              </li>
            </ul>
          </article>
        </TabsContent>
      </Tabs>
    </section>
  );
}
