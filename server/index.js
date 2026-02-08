import http from "http";
import { encryptSecret, decryptSecret } from "./crypto.js";
import { saveToken, getToken } from "./tokenStore.js";
import { verifyToken, upsertDnsRecord, listPagesProjects } from "./cloudflare.js";

const routes = {
  GET: new Map(),
  POST: new Map()
};
const DNS_RESOLVER_URL = process.env.DNS_RESOLVER_URL || "http://localhost:8054/resolve";

function createResponse(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },
    json(payload) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(payload));
    }
  };
}

function parseBody(req) {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(undefined);
      }
    });
  });
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const handler = routes[req.method]?.get(url.pathname);
  if (!handler) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }
  const response = createResponse(res);
  const body = await parseBody(req);
  const request = {
    body,
    query: Object.fromEntries(url.searchParams.entries())
  };
  try {
    await handler(request, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    response.status(500).json({ error: message });
  }
}

const server = http.createServer(handleRequest);

const app = {
  get(path, handler) {
    routes.GET.set(path, handler);
  },
  post(path, handler) {
    routes.POST.set(path, handler);
  },
  listen(port, cb) {
    return server.listen(port, cb);
  }
};

app.post("/api/cloudflare/connect", async (req, res) => {
  const { projectId, token, accountId, zoneId } = req.body || {};
  if (!projectId || !token) return res.status(400).json({ error: "projectId and token required" });

  await verifyToken(token);

  saveToken(projectId, {
    tokenEnc: encryptSecret(token),
    accountId: accountId || null,
    zoneId: zoneId || null,
    createdAt: new Date().toISOString()
  });

  res.json({ ok: true });
});

app.post("/api/cloudflare/dns/upsert", async (req, res) => {
  const { projectId, record } = req.body || {};
  if (!projectId || !record) return res.status(400).json({ error: "projectId and record required" });

  const stored = getToken(projectId);
  if (!stored?.tokenEnc || !stored?.zoneId) return res.status(400).json({ error: "No token/zone saved for this project" });

  const token = decryptSecret(stored.tokenEnc);
  const data = await upsertDnsRecord(token, stored.zoneId, record);
  res.json({ ok: true, result: data.result });
});

app.get("/api/cloudflare/pages/projects", async (req, res) => {
  const { projectId } = req.query || {};
  if (!projectId) return res.status(400).json({ error: "projectId required" });

  const stored = getToken(projectId);
  if (!stored?.tokenEnc || !stored?.accountId) return res.status(400).json({ error: "No token/account saved for this project" });

  const token = decryptSecret(stored.tokenEnc);
  const data = await listPagesProjects(token, stored.accountId);
  res.json({ ok: true, projects: data.result });
});

app.get("/api/dns/resolve", async (req, res) => {
  const { name } = req.query || {};
  if (!name) return res.status(400).json({ error: "name required" });
  const url = new URL(DNS_RESOLVER_URL);
  url.searchParams.set("name", name);
  const response = await fetch(url.toString());
  if (!response.ok) {
    return res.status(502).json({ error: "dns_resolve_failed" });
  }
  const data = await response.json();
  return res.json({ ok: true, result: data });
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
