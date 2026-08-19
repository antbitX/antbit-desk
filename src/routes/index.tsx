import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard";
import { getBitcoinSnapshot } from "@/lib/bitcoin";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return { snapshot: await getBitcoinSnapshot() };
    } catch {
      return { snapshot: null };
    }
  },
  component: Home,
});

function Home() {
  const { snapshot } = Route.useLoaderData();
  return <Dashboard initial={snapshot} />;
}
