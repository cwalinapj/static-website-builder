<div style={{ marginTop: 14, ...card, padding: 16 }}>
  <div style={{ fontWeight: 900, marginBottom: 6 }}>Wallet Extras (optional)</div>
  <div style={{ color: "#6b7280", lineHeight: 1.5, marginBottom: 12 }}>
    Your wallet is used for secure login. If you want, we can also enable extra wallet features (paid add-ons handled by a worker).
  </div>

  <div style={{ display: "grid", gap: 10 }}>
    <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <input
        type="checkbox"
        checked={walletExtras.membership}
        onChange={(e) => setWalletExtras((w) => ({ ...w, membership: e.target.checked }))}
      />
      Membership / token-gated access (Paid)
    </label>

    <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <input
        type="checkbox"
        checked={walletExtras.referrals}
        onChange={(e) => setWalletExtras((w) => ({ ...w, referrals: e.target.checked }))}
      />
      Referral rewards (Paid)
    </label>

    <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <input
        type="checkbox"
        checked={walletExtras.receipts}
        onChange={(e) => setWalletExtras((w) => ({ ...w, receipts: e.target.checked }))}
      />
      On-chain receipts (Paid)
    </label>

    <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <input
        type="checkbox"
        checked={walletExtras.cryptoPayments}
        onChange={(e) => setWalletExtras((w) => ({ ...w, cryptoPayments: e.target.checked }))}
      />
      Accept crypto payments (Paid)
    </label>
  </div>

  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
    <button
      style={btnGhost}
      onClick={() => alert("Saved locally (MVP). Next: persist to backend by project ID.")}
    >
      Save selections
    </button>

    <button
      style={btn}
      onClick={async () => {
        const selected = Object.entries(walletExtras).filter(([, v]) => v).map(([k]) => k);
        if (selected.length === 0) {
          alert("No wallet extras selected.");
          return;
        }
        await createWorkOrder(`Enable wallet extras: ${selected.join(", ")}`);
        alert("Work order created. (MVP)");
      }}
    >
      Create paid add-on request
    </button>
  </div>
</div>
