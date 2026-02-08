import { randomUUID } from "node:crypto";

const DEFAULT_PUBLIC_HOST = process.env.PAGES_PUBLIC_HOST || "pages.dev";

function buildDeploymentId() {
  return `deploy_${randomUUID()}`;
}

export function createPagesClient({ publicHost = DEFAULT_PUBLIC_HOST } = {}) {
  return {
    async deploy({ siteId }) {
      if (!siteId) {
        throw new Error("siteId required for pages deploy");
      }
      const dnsTarget = `${siteId}.${publicHost}`;
      return {
        public_url: `https://${dnsTarget}`,
        deployment_id: buildDeploymentId(),
        dns_target: dnsTarget
      };
    }
  };
}
