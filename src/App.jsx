cat > src/App.jsx <<'EOF'
import React, { useMemo, useState } from "react";

function buildSrcDoc(files) {
  const html = files?.["index.html"] ?? "<!doctype html><html><body></body></html>";
  const css = files?.["styles.css"] ?? "";
  const js = files?.["main.js"] ?? "";

  const withCss = html.includes("</head>")
    ? html.replace("</head>", `<style>${css}</style></head>`)
    : `<style>${css}</style>\n${html}`;

  const withJs = withCss.includes("</body>")
    ? withCss.replace("</body>", `<script>${js}</script></body>`)
    : `${withCss}\n<script>${js}</script>`;

  return withJs;
}

const pill = (text) => ({
  display: "inline-block",
  padding: "3px 8px",
  border: "1px solid #e5e7eb",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  background: "white"
});

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  background: "white"
};

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer"
};

const btnGhost = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "white",
  color: "#111827",
  fontWeight: 900,
  cursor: "pointer"
};

function SetupForm({ value, onChange, onRun, busy }) {
  const row = { display: "grid", gridTemplateColumns: "210px 1fr", gap: 12, padding: "10px 0", alignItems: "center" };
  const label = { fontWeight: 900, color: "#111827" };
  const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", outline: "none" };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 18 }}>
      <div style={{ width: "100%", maxWidth: 760 }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>Setup</div>
        <div style={{ color: "#6b7280", marginBottom: 16 }}>
          Enter the info below. We’ll run the search and show ranking pages + metadata.
        </div>

        <div style={{ ...card, padding: 16 }}>
          <div style={row}>
            <div style={label}>Business type</div>
            <input style={input} value={value.businessType} onChange={(e) => onChange({ ...value, businessType: e.target.value })} />
          </div>

          <div style={{ borderTop: "1px solid #f3f4f6" }} />

          <div style={row}>
            <div style={label}>City, State</div>
            <input style={input} value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })} placeholder="Austin, TX" />
          </div>

          <div style={{ borderTop: "1px solid #f3f4f6" }} />

          <div style={row}>
            <div style={label}>Target keyword #1</div>
            <input style={input} value={value.keyword} onChange={(e) => onChange({ ...value, keyword: e.target.value })} placeholder="emergency plumber" />
          </div>

          <div style={{ borderTop: "1px solid #f3f4f6" }} />

          <div style={row}>
            <div style={label}>Client website URL</div>
            <input style={input} value={value.clientUrl} onChange={(e) => onChange({ ...value, clientUrl: e.target.value })} placeholder="https://client.com/page" />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <button style={{ ...btn, opacity: busy ? 0.7 : 1 }} onClick={onRun} disabled={busy}>
              {busy ? "Running..." : "Run Search"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SerpTable({ data, onContinue }) {
  return (
    <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 980 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>
            SERP + Metadata <span style={pill(data?.query || "")}>{data?.query || ""}</span>
          </div>
          <button style={btn} onClick={onContinue}>Continue</button>
        </div>

        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead style={{ background: "#f9fafb" }}>
                <tr>
                  {["Pos", "Title", "URL", "Meta Title", "Meta Description", "H1"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.results?.map((r) => (
                  <tr key={r.url}>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>{r.position}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{r.title}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>
                      <div style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.url}</div>
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{r.metaTitle}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{r.metaDescription}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{r.h1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: 12, borderTop: "1px solid #e5e7eb", background: "#fff" }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Client rank (mock)</div>
            <div style={{ color: "#6b7280" }}>
              {data?.client?.rank === 999 ? "Client not found in top results." : `Client appears around position: ${data.client.rank}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PickWinner({ data, winnerUrl, setWinnerUrl }) {
  const top3 = (data?.results || []).slice(0, 3);
  const client = data?.client;

  const tiles = [
    ...top3.map((r) => ({ label: `Top #${r.position}`, url: r.url, img: r.screenshotUrl })),
    client ? { label: "Mine", url: client.url, img: client.screenshotUrl } : null
  ].filter(Boolean);

  return (
    <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 980 }}>
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>
          Which do you like best?
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {tiles.map((t) => (
            <button
              key={t.url}
              onClick={() => setWinnerUrl(t.url)}
              style={{
                textAlign: "left",
                padding: 0,
                ...card,
                overflow: "hidden",
                cursor: "pointer",
                outline: winnerUrl === t.url ? "3px solid #111827" : "none"
              }}
            >
              <div style={{ padding: 10, borderBottom: "1px solid #e5e7eb", fontWeight: 900 }}>{t.label}</div>
              <img alt={t.label} src={t.img} style={{ width: "100%", display: "block" }} />
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, color: "#6b7280" }}>
          {winnerUrl ? `Selected: ${winnerUrl}` : "Select one to continue."}
        </div>
      </div>
    </div>
  );
}

function ContactForm({ value, onChange, onContinue }) {
  const row = { display: "grid", gridTemplateColumns: "210px 1fr", gap: 12, padding: "10px 0", alignItems: "center" };
  const label = { fontWeight: 900, color: "#111827" };
  const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", outline: "none" };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 18 }}>
      <div style={{ width: "100%", maxWidth: 760 }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>Contact details</div>
        <div style={{ color: "#6b7280", marginBottom: 16 }}>We’ll place these on the site.</div>

        <div style={{ ...card, padding: 16 }}>
          <div style={row}>
            <div style={label}>Address</div>
            <input style={input} value={value.address} onChange={(e) => onChange({ ...value, address: e.target.value })} />
          </div>
          <div style={{ borderTop: "1px solid #f3f4f6" }} />
          <div style={row}>
            <div style={label}>Phone</div>
            <input style={input} value={value.phone} onChange={(e) => onChange({ ...value, phone: e.target.value })} />
          </div>
          <div style={{ borderTop: "1px solid #f3f4f6" }} />
          <div style={row}>
            <div style={label}>Cellphone</div>
            <input style={input} value={value.cell} onChange={(e) => onChange({ ...value, cell: e.target.value })} />
          </div>
          <div style={{ borderTop: "1px solid #f3f4f6" }} />
          <div style={row}>
            <div style={label}>Email</div>
            <input style={input} value={value.email} onChange={(e) => onChange({ ...value, email: e.target.value })} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <button style={btn} onClick={onContinue}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackPanel({ feedback, setFeedback, onApply, busy }) {
  return (
    <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 760 }}>
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>What do you like and what do you not like?</div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={6}
          style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", outline: "none" }}
          placeholder="Tell us what to keep, what to remove, what to change…"
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button style={{ ...btn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={onApply}>
            {busy ? "Updating..." : "Update draft"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Finalize({ value, onChange, onDone }) {
  const row = { display: "grid", gridTemplateColumns: "240px 1fr", gap: 12, padding: "10px 0", alignItems: "center" };
  const label = { fontWeight: 900, color: "#111827" };

  return (
    <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 760 }}>
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>Finish setup</div>

        <div style={{ ...card, padding: 16 }}>
          <div style={row}>
            <div style={label}>Is 24 hours okay to deliver?</div>
            <select
              value={value.deliveryHours}
              onChange={(e) => onChange({ ...value, deliveryHours: Number(e.target.value) })}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
            >
              <option value={24}>Yes (24 hours)</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours</option>
            </select>
          </div>

          <div style={{ borderTop: "1px solid #f3f4f6" }} />

          <div style={row}>
            <div style={label}>Domain</div>
            <select
              value={value.domainChoice}
              onChange={(e) => onChange({ ...value, domainChoice: e.target.value })}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
            >
              <option value="subdomain_free">Subdomain (Free)</option>
              <option value="custom_paid">Custom domain (Paid)</option>
            </select>
          </div>

          <div style={{ borderTop: "1px solid #f3f4f6" }} />

          <div style={row}>
            <div style={label}>Email handling</div>
            <select
              value={value.emailChoice}
              onChange={(e) => onChange({ ...value, emailChoice: e.target.value })}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
            >
              <option value="inbound_free">Inbound-only forwarding (Free)</option>
              <option value="google_paid">Inbound + outbound (Paid — Google Workspace)</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button style={btn} onClick={onDone}>Confirm</button>
          </div>

          <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
            Note: outbound email and custom domains have costs.
            Non-static features (booking, payments, logins, databases, CRM, campaigns, etc.) are paid worker add-ons.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState("setup"); // setup -> serp -> pick -> contact -> build -> finalize -> done

  const [setup, setSetup] = useState({
    businessType: "",
    location: "",
    keyword: "",
    clientUrl: ""
  });

  const [serp, setSerp] = useState(null);
  const [winnerUrl, setWinnerUrl] = useState("");
  const [contact, setContact] = useState({ address: "", phone: "", cell: "", email: "" });

  const [files, setFiles] = useState(null);
  const srcDoc = useMemo(() => buildSrcDoc(files), [files]);

  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  const [finalize, setFinalize] = useState({
    deliveryHours: 24,
    domainChoice: "subdomain_free",
    emailChoice: "inbound_free"
  });
  const [walletExtras, setWalletExtras] = useState({
    membership: false,
    referrals: false,
    receipts: false,
    cryptoPayments: false
  });

  async function runSerp() {
    setBusy(true);
    try {
      const r = await fetch("/api/serp-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: setup.keyword,
          location: setup.location,
          clientUrl: setup.clientUrl
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "SERP audit failed");
      setSerp(data);
      setStep("serp");
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function generateDraft() {
    if (!serp || !winnerUrl) return;
    setBusy(true);
    try {
      const winner = serp.results.find((x) => x.url === winnerUrl);
      const r = await fetch("/api/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setup,
          winner,
          client: serp.client,
          contact
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Generate failed");
      setFiles(data.files);
      setStep("build");
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function applyFeedback() {
    setBusy(true);
    try {
      const r = await fetch("/api/apply-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, feedback })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Update failed");
      setFiles(data.files);
      setFeedback("");
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function createWorkOrder(description) {
    const r = await fetch("/api/work-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || `Work order failed (status ${r.status})`);
    return data;
  }

  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {/* LEFT */}
      <div style={{ display: "grid", gridTemplateRows: "auto 1fr", borderRight: "1px solid #e5e7eb" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", fontWeight: 900 }}>
          Static Builder <span style={{ marginLeft: 8, ...pill(step) }}>{step}</span>
        </div>

        <div style={{ overflow: "auto" }}>
          {step === "setup" && (
            <SetupForm
              value={setup}
              onChange={setSetup}
              busy={busy}
              onRun={() => {
                if (!setup.businessType || !setup.location || !setup.keyword || !setup.clientUrl) {
                  alert("Fill all fields.");
                  return;
                }
                runSerp();
              }}
            />
          )}

          {step === "serp" && <SerpTable data={serp} onContinue={() => setStep("pick")} />}

          {step === "pick" && (
            <div>
              <PickWinner data={serp} winnerUrl={winnerUrl} setWinnerUrl={setWinnerUrl} />
              <div style={{ display: "flex", justifyContent: "center", paddingBottom: 16 }}>
                <div style={{ width: "100%", maxWidth: 980, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button style={btnGhost} onClick={() => setStep("serp")}>Back</button>
                  <button
                    style={btn}
                    onClick={() => {
                      if (!winnerUrl) return alert("Pick one.");
                      setStep("contact");
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "contact" && (
            <ContactForm value={contact} onChange={setContact} onContinue={() => generateDraft()} />
          )}

          {step === "build" && (
            <div>
              <FeedbackPanel feedback={feedback} setFeedback={setFeedback} onApply={applyFeedback} busy={busy} />
              <div style={{ display: "flex", justifyContent: "center", paddingBottom: 16 }}>
                <div style={{ width: "100%", maxWidth: 760, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button style={btnGhost} onClick={() => setStep("finalize")}>Finish</button>
                </div>
              </div>
            </div>
          )}

          {step === "finalize" && <Finalize value={finalize} onChange={setFinalize} onDone={() => setStep("done")} />}

          {step === "done" && (
            <div style={{ padding: 18, display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: 760, ...card, padding: 16 }}>
                <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>This site is yours.</div>
                <div style={{ color: "#6b7280", lineHeight: 1.5 }}>
                  Static work is complete. Any non-static features (booking, payments, logins, databases, CRM, campaigns, etc.)
                  are paid worker add-ons.
                </div>
                <div style={{ color: "#6b7280", marginTop: 8 }}>Wallet is used for authentication only.</div>

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  <div><b>Delivery:</b> {finalize.deliveryHours} hours</div>
                  <div><b>Domain:</b> {finalize.domainChoice === "subdomain_free" ? "Subdomain (Free)" : "Custom domain (Paid)"}</div>
                  <div><b>Email:</b> {finalize.emailChoice === "inbound_free" ? "Inbound-only (Free)" : "Inbound + outbound (Paid)"}</div>
                </div>

                <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                  <button style={btnGhost} onClick={() => alert("ZIP export not wired yet. Add later.")}>Download files</button>
                  <button style={btn} onClick={() => alert("Wallet auth not wired yet. Add later.")}>Open builder (MetaMask login)</button>
                </div>

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
                        const selectedExtras = Object.entries(walletExtras).filter(([, v]) => v).map(([k]) => k);
                        if (selectedExtras.length === 0) {
                          alert("No wallet extras selected.");
                          return;
                        }
                        try {
                          await createWorkOrder(`Enable wallet extras: ${selectedExtras.join(", ")}`);
                          alert("Work order created. (MVP)");
                        } catch (e) {
                          alert(e.message);
                        }
                      }}
                    >
                      Create paid add-on request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: "grid", gridTemplateRows: "auto 1fr" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", fontWeight: 900 }}>
          {step === "build" || step === "finalize" || step === "done" ? "Live Preview" : "Setup"}
        </div>

        {step === "build" || step === "finalize" || step === "done" ? (
          <iframe
            title="preview"
            sandbox="allow-scripts allow-forms allow-modals"
            srcDoc={srcDoc}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ width: "100%", maxWidth: 520 }}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Follow the flow on the left</div>
              <div style={{ color: "#6b7280", lineHeight: 1.5 }}>
                Preview stays hidden until we generate the draft after the winner is selected and contact details are added.
              </div>
              <div style={{ marginTop: 14, ...card, padding: 14 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Paid add-ons (worker required)</div>
                <div style={{ color: "#6b7280" }}>
                  booking • payments • logins • databases • CRM • campaigns • memberships • orders/inventory • persistent chat • saved user data
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
EOF
