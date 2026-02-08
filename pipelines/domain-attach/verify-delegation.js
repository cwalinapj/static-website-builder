const DEFAULT_NS = [
  process.env.DNS_NS1 || "ns1.staticbuilder.dev",
  process.env.DNS_NS2 || "ns2.staticbuilder.dev"
];

const DNS_RESOLVER_URL = process.env.DNS_RESOLVER_URL || "";

function normalizeName(value) {
  return value.toLowerCase().replace(/\.$/, "");
}

function extractAnswers(payload) {
  const candidates = [payload, payload?.result];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const answers = candidate.Answer || candidate.answers || candidate.answer || candidate.records || [];
    if (Array.isArray(answers) && answers.length) {
      return answers;
    }
  }
  return [];
}

function extractNsRecords(payload) {
  const answers = extractAnswers(payload);
  const records = [];
  for (const item of answers) {
    const value = item?.data || item?.value || item?.target || item?.content || item;
    if (typeof value === "string") {
      records.push(normalizeName(value));
    }
  }
  return records;
}

async function resolveNs(domain, resolverUrl) {
  if (!resolverUrl) {
    throw new Error("DNS_RESOLVER_URL not configured");
  }
  const url = new URL(resolverUrl);
  url.searchParams.set("name", domain);
  url.searchParams.set("type", "NS");
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`dns_resolve_failed: ${response.status}`);
  }
  const payload = await response.json();
  return extractNsRecords(payload);
}

export async function verifyDelegation(domain, { expectedNameservers = DEFAULT_NS, resolverUrl = DNS_RESOLVER_URL } = {}) {
  if (!domain) {
    throw new Error("domain required");
  }
  const expected = expectedNameservers.map(normalizeName);
  const actual = await resolveNs(domain, resolverUrl);
  const missing = expected.filter((ns) => !actual.includes(ns));

  return {
    ok: missing.length === 0,
    expected,
    actual,
    missing
  };
}
