import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Expected strings come from the lab's own canonical sources, never from prose
// invented here: the manifest owns routes, titles and the evidence policy.
const manifest = JSON.parse(
  readFileSync(fileURLToPath(new URL('../lab.manifest.json', import.meta.url)), 'utf8'),
) as {
  experiments: { id: string; title: Record<string, string>; route: string }[];
  lessons: { id: string; route: string }[];
  evidencePolicy: { allowedKinds: string[] };
  evidence: { kind: string }[];
};

const experiment = (id: string) => {
  const found = manifest.experiments.find((x) => x.id === id);
  if (!found) throw new Error(`Unknown manifest experiment: ${id}`);
  return found;
};

/** Presses Tab until the target control holds focus, proving tab order reaches it. */
async function tabTo(page: Page, selector: string) {
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    if (
      await page
        .locator(selector)
        .evaluate((el) => el === document.activeElement)
        .catch(() => false)
    )
      return;
  }
  throw new Error(`Tab order never reached ${selector}`);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // The page heading is app copy rather than a manifest string, so the contract
  // asserted here is structural: exactly one visible level-1 heading.
  await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty();
  await expect(page.locator('#workbench')).toBeVisible();
});

test('every manifest scenario route selects its own scenario', async ({ page }) => {
  for (const declared of manifest.experiments) {
    await page.goto(declared.route);
    // The scenario select is the routing surface; both its value and its option
    // label must follow the manifest, not a second hardcoded list.
    const select = page.getByLabel('Scenario', { exact: true });
    await expect(select).toHaveValue(declared.id);
    await expect(
      select.locator(`option[value="${declared.id}"]`),
    ).toHaveText(declared.title.en);
    await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty();
    await expect(page.getByTestId('eligible-count')).not.toBeEmpty();
  }
});

test('the guided lesson route opens the Learn mode', async ({ page }) => {
  const lesson = manifest.lessons[0];
  await page.goto(lesson.route);
  await expect(
    page.locator('nav.mode-nav button[aria-current="page"]'),
  ).toHaveText('Learn');
});

test('the language controls change the rendered locale in both directions', async ({ page }) => {
  const heading = page.getByRole('heading', { level: 1 });
  const english = await heading.innerText();
  // The language buttons carry explicit accessible names, so they are selected
  // by role and name rather than by their visible "EN"/"TR" text.
  await page.getByRole('button', { name: 'Türkçe' }).click();
  await expect(heading).not.toHaveText(english);
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page).toHaveURL(/[?&]lang=tr(&|$)/);
  // A localized control label, not just a heading swap.
  await expect(page.locator('nav.mode-nav button').first()).toHaveText('Karşılaştır');

  await page.getByRole('button', { name: 'English' }).click();
  await expect(heading).toHaveText(english);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.goto('/?lang=tr');
  await expect(heading).not.toHaveText(english);
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
});

test('the laboratory reset is reachable and operable by keyboard alone', async ({ page }) => {
  await page.goto(experiment('privacy').route);
  // Change a scenario-specific control so reset has something to undo.
  await page.getByLabel('Scenario', { exact: true }).selectOption('startup');
  await expect(page.getByLabel('Scenario', { exact: true })).toHaveValue('startup');

  await tabTo(page, '[data-ils-action="reset"]');
  await page.keyboard.press('Enter');
  // Reset returns the whole laboratory to its default scenario, not the route's
  // scenario, and clears the route parameters it was opened with.
  await expect(page.getByLabel('Scenario', { exact: true })).toHaveValue('team70');
  await expect(
    page.locator('nav.mode-nav button[aria-current="page"]'),
  ).toHaveText('Compare');
  await expect(page).toHaveURL(/[?&]lang=(en|tr)(&|$)/);
  await expect(page).not.toHaveURL(/[?&]scenario=/);
});

test('the mode navigation is operable by keyboard alone', async ({ page }) => {
  const cost = page.locator('nav.mode-nav button', { hasText: 'Cost' });
  await tabTo(page, 'nav.mode-nav button:has-text("Cost")');
  await page.keyboard.press('Enter');
  await expect(cost).toHaveAttribute('aria-current', 'page');
});

test('rendered evidence never claims a kind the evidence policy forbids', async ({ page }) => {
  await page.goto(experiment('company').route);
  // The shared shell exposes each evidence record's kind as a data attribute,
  // so this checks the shipped contract instead of any numeric result.
  const kinds = await page.locator('[data-evidence-kind]').evaluateAll((nodes) =>
    nodes.map((n) => n.getAttribute('data-evidence-kind')),
  );
  expect(kinds.length).toBeGreaterThan(0);
  for (const kind of kinds) {
    expect(manifest.evidencePolicy.allowedKinds).toContain(kind);
    expect(kind).not.toBe('measured');
  }
  for (const record of manifest.evidence) {
    expect(manifest.evidencePolicy.allowedKinds).toContain(record.kind);
    expect(record.kind).not.toBe('measured');
  }
});

test('eligibility stays separate from preference ranking', async ({ page }) => {
  await page.goto(experiment('team70').route);
  // Eligibility is a count over the candidate set, not a winner claim.
  const eligible = page.getByTestId('eligible-count');
  await expect(eligible).not.toBeEmpty();
  const count = Number((await eligible.innerText()).split('/')[0].trim());
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(6);
  await expect(page.getByTestId('peak-memory')).not.toBeEmpty();
});

test('desktop and mobile viewports render without horizontal overflow', async ({ page }) => {
  for (const size of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    await page.goto(experiment('batch').route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#workbench')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
      size.width,
    );
  }
});
