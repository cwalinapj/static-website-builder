# Publishing lanes

## Lane 1: Static Pages (Cloudflare Pages)
- **Input:** `dist/` (static HTML/CSS/JS build output)
- **Output:** `{ public_url, deployment_id, dns_target }`
- **MVP limits:**
  - Max pages: **5** HTML files (override via `PAGES_MAX_PAGES`)
  - Max total size: **5 MB** (override via `PAGES_MAX_TOTAL_BYTES`)
  - Max publishes per day: **3** per site (override via `PAGES_MAX_PUBLISHES_PER_DAY`)

The deploy flow is implemented in `pipelines/static-pages`. The client returns a Pages-style hostname
(`PAGES_PUBLIC_HOST`, default `pages.dev`) and a deployment id for downstream DNS attachment.

## Lane 4: Domain attach (authoritative DNS)
- **Input:** `{ siteId, domain, dns_target }`
- **Output:** DNS records for `www` and an apex redirect to `www`
- **Requirements:**
  - Domain is delegated to **ns1/ns2** (`DNS_NS1`/`DNS_NS2` overrides, defaults to `ns1.staticbuilder.dev` and
    `ns2.staticbuilder.dev`)
  - `www` CNAME points at `dns_target`
  - Apex redirect points to `https://www.<domain>` for MVP (`APEX_REDIRECT_SCHEME` override)

The attach flow is implemented in `pipelines/domain-attach`. It uses `DNS_RESOLVER_URL` to verify
delegation and calls `DNS_API_URL` (when set) to upsert records. Without `DNS_API_URL`, it stores
records locally under `.builder/` for MVP testing.

## CLI
- `builder publish --site <id> --lane pages`
- `builder attach-domain --site <id> --domain example.com`
