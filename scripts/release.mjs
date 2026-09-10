import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
const artifact = resolve("dist");
const hash = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
const inventory = (directory = "") =>
  readdirSync(resolve(artifact, directory), { withFileTypes: true })
    .flatMap((entry) => {
      const path = directory ? `${directory}/${entry.name}` : entry.name;
      return entry.isDirectory()
        ? inventory(path)
        : entry.isFile() &&
            !["release.json", "staticwebapp.config.json"].includes(path)
          ? [path]
          : [];
    })
    .sort();
if (process.argv.includes("--verify")) {
  const r = JSON.parse(readFileSync(resolve(artifact, "release.json"), "utf8"));
  if (
    r.application !== "dcl-aserdargun-com" ||
    !r.assets["index.html"] ||
    !r.deploymentConfigSha256
  )
    throw new Error("Invalid release manifest");
  if (process.env.GITHUB_SHA && r.commit !== process.env.GITHUB_SHA)
    throw new Error("Release SHA mismatch");
  if (process.env.GITHUB_SHA && r.sourceState !== "clean")
    throw new Error("Production release requires a clean source tree");
  if (
    JSON.stringify(Object.keys(r.assets).sort()) !== JSON.stringify(inventory())
  )
    throw new Error("Release asset inventory mismatch");
  if (
    hash(resolve(artifact, "staticwebapp.config.json")) !==
    r.deploymentConfigSha256
  )
    throw new Error("Deployment configuration mismatch");
  for (const [path, digest] of Object.entries(r.assets))
    if (hash(resolve(artifact, path)) !== digest)
      throw new Error(`Asset mismatch: ${path}`);
  console.log(
    `Verified ${Object.keys(r.assets).length} release assets for ${r.commit}`,
  );
} else {
  let commit = process.env.GITHUB_SHA;
  let sourceState = "unknown";
  try {
    sourceState = execFileSync("git", ["status", "--porcelain"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
      ? "modified"
      : "clean";
  } catch {
    /* Unversioned builds retain an explicit unknown state. */
  }
  if (!commit) {
    try {
      commit = execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    } catch {
      commit = "uncommitted";
    }
  }
  const html = readFileSync(resolve(artifact, "index.html"), "utf8");
  const referenced = [
    "index.html",
    "favicon.svg",
    ...Array.from(html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g), (m) =>
      m[1].slice(1),
    ),
  ];
  for (const path of referenced)
    if (!existsSync(resolve(artifact, path)))
      throw new Error(`Missing artifact ${path}`);
  const result = {
    application: "dcl-aserdargun-com",
    version: "1.0.0",
    commit,
    sourceState,
    builtAt: new Date().toISOString(),
    dataStatus: "EDUCATIONAL_DEFAULT",
    deploymentConfigSha256: hash(resolve(artifact, "staticwebapp.config.json")),
    assets: Object.fromEntries(
      inventory().map((p) => [p, hash(resolve(artifact, p))]),
    ),
  };
  writeFileSync(
    resolve(artifact, "release.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
}
