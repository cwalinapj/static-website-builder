const DEFAULT_PUBLIC_HOST = process.env.PAGES_PUBLIC_HOST || "pages.dev";

function buildDeploymentId() {
  const now = Date.now();
  const suffix = Math.random().toString(36).slice(2, 8);
  return `deploy_${now}_${suffix}`;
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
