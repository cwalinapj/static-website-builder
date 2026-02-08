import { verifyDelegation } from "./verify-delegation.js";
import { upsertApexRedirect, upsertCnameRecord } from "./dns-records.js";

function stripWwwPrefix(domain) {
  return domain.replace(/^www\./i, "");
}

export async function attachDomain({ siteId, domain, dnsTarget } = {}) {
  if (!siteId) {
    throw new Error("siteId required");
  }
  if (!domain) {
    throw new Error("domain required");
  }
  if (!dnsTarget) {
    throw new Error("dnsTarget required");
  }

  const apexDomain = stripWwwPrefix(domain);
  const delegation = await verifyDelegation(apexDomain);
  if (!delegation.ok) {
    throw new Error(`Domain not delegated to required nameservers: ${delegation.missing.join(", ")}`);
  }

  const wwwHost = `www.${apexDomain}`;
  const cnameRecord = await upsertCnameRecord({ name: wwwHost, target: dnsTarget });
  const redirectRecord = await upsertApexRedirect({
    domain: apexDomain,
    target: `https://${wwwHost}`
  });

  return {
    ok: true,
    siteId,
    domain: apexDomain,
    dns_target: dnsTarget,
    records: {
      www: cnameRecord,
      apex_redirect: redirectRecord
    }
  };
}
