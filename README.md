# Static Website Builder (MVP)

This repo is a **proof of concept** static site builder with a small server for Cloudflare Pages automation.

> Note: Cloudflare is used **only as a PoC** for now.

## API
- `POST /api/cloudflare/connect` (PoC token storage)
- `POST /api/cloudflare/dns/upsert` (PoC DNS record update)
- `GET /api/cloudflare/pages/projects` (PoC Pages list)
- `GET /api/dns/resolve?name=<domain>` (DNS resolver proxy)

## DNS integration
Set the resolver URL (defaults to local MVP):
```
DNS_RESOLVER_URL=http://localhost:8054/resolve
```

## Run
```bash
node server/index.js
```

## Cloudflare PoC
Cloudflare integration is temporary while we validate the workflow. It will be replaced with on-chain/registry flows.
