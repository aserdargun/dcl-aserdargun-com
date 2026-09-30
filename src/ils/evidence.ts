// Authored evidence surfaces. Everything here is a record the visitor can read:
// the source ledger, the concept bodies, the executed browser regression record
// and the shared-laboratory scope. Nothing in this module calculates a result
// and nothing here turns a synthetic value into a verified one.
import rawConcepts from "./concepts.json";
import rawSources from "./sources.json";
import rawBrowserChecks from "../../docs/browser-checks.json";
import { learningGraph } from "./graph";
import type { Locale } from "../core/types";

export interface Localized {
  en: string;
  tr: string;
}

export const localize = (value: Localized, locale: Locale) =>
  value[locale === "en" ? "en" : "tr"];

export interface SourceRecord {
  id: string;
  title: string;
  publisher: string;
  url: string;
  /** Source-stated publication date. Null when the page states none. */
  published: string | null;
  /** Date this record was read; the only date DCL itself can assert. */
  accessed: string;
  concepts: string[];
  supports: Localized;
  doesNotSupport: Localized;
}

export const sourcePolicy = rawSources.policy as Localized;
export const sources = rawSources.records as SourceRecord[];
export const sourceById = new Map(sources.map((s) => [s.id, s]));

export interface ConceptRecord {
  id: string;
  label: Localized;
  body: Localized;
  sourceRefs: string[];
}

export const concepts = rawConcepts as ConceptRecord[];

export const browserChecks = rawBrowserChecks as {
  checks: string[];
  scenarioChecks: { scenario: string; result: string }[];
  method: string;
  productionURL: string;
  date: string;
};

/** The shared laboratory scope DCL belongs to, read from the captured graph. */
export const sharedLab = {
  applications: learningGraph.applications.map((a) => ({
    appId: a.appId,
    name: a.name,
    canonicalUrl: a.canonicalUrl,
    status: a.status ?? null,
    catalogSource: a.catalogSource,
  })),
  conceptCount: learningGraph.concepts.length,
  edgeCount: learningGraph.edges.length,
  dclConceptIds: [
    ...new Set(
      learningGraph.placements
        .filter((p) => p.appId === "dcl")
        .map((p) => p.conceptId),
    ),
  ],
  paths: learningGraph.paths
    .filter((p) => p.steps.some((s) => s.appId === "dcl"))
    .map((p) => ({
      id: p.id,
      // The graph marks a Turkish label optional; the English label is shown
      // unchanged rather than an invented translation.
      title: { en: p.title.en, tr: p.title.tr ?? p.title.en },
      steps: p.steps,
    })),
};
