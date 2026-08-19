export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/80 bg-bg/70">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 text-xs leading-relaxed text-subtle sm:px-6">
        <p className="font-medium uppercase tracking-[0.16em] text-muted">Disclaimer</p>
        <p>
          antbit is an informational Bitcoin desk. Nothing on this site is financial, investment, tax, or
          legal advice. Figures are for display only and are not an offer, solicitation, or recommendation
          to buy, sell, or hold bitcoin or any other asset.
        </p>
        <p>
          Prices, supply, market cap, all-time high, node counts, and difficulty are aggregated from third
          parties (including Coinbase, Kraken, blockchain.info, Blockstream, and btcnodes.io) and may be
          delayed, incomplete, or wrong. Past performance is not a guide to future results. Bitcoin is
          volatile and you can lose money.
        </p>
        <p>
          You are solely responsible for your own research and decisions. Consult a licensed adviser before
          acting. antbit, its operator, and data providers accept no liability for loss or damage arising
          from use of this site or reliance on any figure shown.
        </p>
        <p>Not a broker, exchange, custodian, or fiduciary. Not financial advice.</p>
      </div>
    </footer>
  );
}
