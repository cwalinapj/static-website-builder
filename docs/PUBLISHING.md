# Publishing

## Cloudflare Pages (Lane 1)
Build your static site to `dist/` and publish:

```bash
builder publish --site my-site --lane pages
```

The command enforces MVP limits (5 pages, 5 MB total, 3 publishes/day). You can override limits with:

```bash
PAGES_MAX_PAGES=5 \
PAGES_MAX_TOTAL_BYTES=5242880 \
PAGES_PUBLISHES_PER_DAY=3 \
builder publish --site my-site --lane pages
```

The output returns `{ public_url, deployment_id, dns_target }` for the deployment.

## Attach a custom domain (Lane 4)
Delegate the domain to `ns1.staticbuilder.dev` and `ns2.staticbuilder.dev` (override with `DNS_NS1`/`DNS_NS2`),
then attach:

```bash
builder attach-domain --site my-site --domain example.com
```

`builder attach-domain` verifies delegation via `DNS_RESOLVER_URL` and creates:
- `www.example.com` CNAME → `dns_target`
- Apex redirect → `https://www.example.com` (`APEX_REDIRECT_SCHEME` override)

Set `DNS_API_URL` to point at your authoritative DNS API for record creation. If unset, records are
stored locally under `.builder/` for MVP testing.
