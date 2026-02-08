#!/usr/bin/env node
import { deployStaticPages } from "../pipelines/static-pages/deploy.js";
import { attachDomain } from "../pipelines/domain-attach/attach.js";

function readFlag(args, flag) {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  return args[index + 1] || null;
}

function printUsage() {
  console.log(`Usage:
  builder publish --site <id> --lane pages [--dist dist]
  builder attach-domain --site <id> --domain example.com [--dns-target target]
`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  if (command === "publish") {
    const siteId = readFlag(args, "--site");
    const lane = readFlag(args, "--lane") || "pages";
    const distDir = readFlag(args, "--dist") || "dist";
    if (!siteId) {
      throw new Error("--site is required");
    }
    if (lane !== "pages") {
      throw new Error(`Unsupported lane: ${lane}`);
    }
    const result = await deployStaticPages({ siteId, distDir });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === "attach-domain") {
    const siteId = readFlag(args, "--site");
    const domain = readFlag(args, "--domain");
    const dnsTarget = readFlag(args, "--dns-target") || `${siteId}.pages.dev`;
    if (!siteId) {
      throw new Error("--site is required");
    }
    if (!domain) {
      throw new Error("--domain is required");
    }
    const result = await attachDomain({ siteId, domain, dnsTarget });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  printUsage();
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
