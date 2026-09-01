import { spawnSync } from "node:child_process";

const severityRank = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};
const threshold = severityRank.high;
const allowedAdvisories = new Map([
  ["GHSA-w3rx-r6r6-pgpr", "2026-09-27"],
  ["GHSA-5p2g-fcmc-qvqq", "2026-09-27"],
]);

const isWindows = process.platform === "win32";
const auditCommand = isWindows ? process.env.ComSpec ?? "cmd.exe" : "npm";
const auditArgs = isWindows
  ? ["/d", "/s", "/c", "npm.cmd audit --json"]
  : ["audit", "--json"];
const audit = spawnSync(auditCommand, auditArgs, {
  encoding: "utf8",
  shell: false,
});

let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  process.stderr.write(audit.stderr || audit.stdout || "npm audit returned no report.\n");
  process.exit(1);
}

if (report.error || !report.vulnerabilities) {
  process.stderr.write(`${JSON.stringify(report.error ?? report, null, 2)}\n`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const advisoryId = (url) => url?.match(/GHSA-[\w-]+/)?.[0];

function highAdvisoriesFor(packageName, visited = new Set()) {
  if (visited.has(packageName)) return new Set();
  visited.add(packageName);

  const vulnerability = report.vulnerabilities[packageName];
  const ids = new Set();

  for (const source of vulnerability?.via ?? []) {
    if (typeof source === "string") {
      for (const id of highAdvisoriesFor(source, visited)) ids.add(id);
      continue;
    }

    if ((severityRank[source.severity] ?? 0) < threshold) continue;
    const id = advisoryId(source.url);
    if (id) ids.add(id);
  }

  return ids;
}

const failures = [];
const accepted = new Set();

for (const [packageName, vulnerability] of Object.entries(report.vulnerabilities)) {
  const rank = severityRank[vulnerability.severity] ?? 0;
  if (rank < threshold) continue;

  const ids = highAdvisoriesFor(packageName);
  const reasons = [];

  if (rank >= severityRank.critical) reasons.push("critical severity is never exempted");
  if (ids.size === 0) reasons.push("no traceable advisory identifier");

  for (const id of ids) {
    const expires = allowedAdvisories.get(id);
    if (!expires) reasons.push(`${id} is not allowlisted`);
    else if (today > expires) reasons.push(`${id} exception expired on ${expires}`);
    else accepted.add(id);
  }

  if (reasons.length > 0) failures.push(`${packageName}: ${reasons.join(", ")}`);
}

if (failures.length > 0) {
  process.stderr.write(`Dependency audit failed:\n- ${failures.join("\n- ")}\n`);
  process.exit(1);
}

if (accepted.size > 0) {
  process.stdout.write(
    `Dependency audit passed with temporary build-tool exceptions: ${[...accepted].join(", ")}\n`,
  );
} else {
  process.stdout.write("Dependency audit passed with no high-severity findings.\n");
}
