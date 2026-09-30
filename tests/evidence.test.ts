import { expect, it } from "vitest";
import {
  browserChecks,
  concepts,
  sharedLab,
  sourceById,
  sources,
} from "../src/ils/evidence";
import { manifest } from "../src/ils/catalog";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

it("every source record carries a publisher, a URL, an access date and a boundary", () => {
  expect(sources.length).toBeGreaterThan(0);
  for (const s of sources) {
    expect(s.publisher.length).toBeGreaterThan(3);
    expect(s.url).toMatch(/^https:\/\//);
    expect(s.accessed).toMatch(ISO_DAY);
    // A missing publication date stays null and is rendered as missing; it is
    // never replaced with a guessed date.
    if (s.published !== null) expect(s.published).toMatch(ISO_DAY);
    // The ledger only backs concepts, so each record must say what it does not
    // support. This is what keeps the panel from reading as price evidence.
    expect(s.supports.en.length).toBeGreaterThan(20);
    expect(s.supports.tr.length).toBeGreaterThan(20);
    expect(s.doesNotSupport.en.length).toBeGreaterThan(20);
    expect(s.doesNotSupport.tr.length).toBeGreaterThan(20);
  }
});

it("every ledger URL is unique and every concept reference resolves", () => {
  expect(new Set(sources.map((s) => s.url)).size).toBe(sources.length);
  for (const c of concepts) {
    for (const ref of c.sourceRefs) {
      expect(sourceById.get(ref), `${c.id} → ${ref}`).toBeDefined();
    }
  }
  const referenced = new Set(concepts.flatMap((c) => c.sourceRefs));
  // Every ledger record is reachable from a concept or explicitly carries an
  // empty concept list; nothing is shipped that nothing points at by accident.
  for (const s of sources) {
    expect(s.concepts.length === 0 || referenced.has(s.id)).toBe(true);
    for (const id of s.concepts) {
      expect(concepts.map((c) => c.id)).toContain(id);
    }
  }
});

it("concepts stay bilingual, in manifest parity, and explained", () => {
  expect(concepts.map((c) => c.id)).toEqual(manifest.concepts);
  for (const c of concepts) {
    expect(c.label.en.length).toBeGreaterThan(0);
    expect(c.label.tr.length).toBeGreaterThan(0);
    expect(c.body.en.length).toBeGreaterThan(60);
    expect(c.body.tr.length).toBeGreaterThan(60);
  }
});

it("the executed browser record keeps its date, method and full check list", () => {
  expect(browserChecks.date).toMatch(ISO_DAY);
  expect(browserChecks.method.length).toBeGreaterThan(0);
  expect(browserChecks.checks.length).toBeGreaterThan(0);
  for (const check of browserChecks.checks)
    expect(check.length).toBeGreaterThan(0);
  for (const row of browserChecks.scenarioChecks) {
    expect(row.scenario.length).toBeGreaterThan(0);
    expect(row.result.length).toBeGreaterThan(0);
  }
});

it("the shared scope is the captured graph, not a claim of shared measurement", () => {
  expect(sharedLab.applications.length).toBe(14);
  expect(new Set(sharedLab.applications.map((a) => a.canonicalUrl)).size).toBe(
    14,
  );
  for (const a of sharedLab.applications)
    expect(a.canonicalUrl).toMatch(/^https:\/\//);
  expect(sharedLab.conceptCount).toBe(74);
  expect(sharedLab.edgeCount).toBe(197);
  // DCL owns the same five concepts the panel explains, from the same graph.
  expect([...sharedLab.dclConceptIds].sort()).toEqual(
    concepts.map((c) => c.id).sort(),
  );
});
