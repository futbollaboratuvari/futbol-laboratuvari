import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const target = process.env.TARGET_URL || 'https://www.futbollaboratuuvari.org/';
const outDir = 'qa-artifacts';
await fs.mkdir(outDir, { recursive: true });

const report = {
  target,
  startedAt: new Date().toISOString(),
  desktop: {},
  mobile: {},
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
};

const browser = await chromium.launch({ headless: true });

function attachDiagnostics(page, bucket) {
  page.on('console', msg => {
    if (msg.type() === 'error') report.consoleErrors.push({ bucket, text: msg.text() });
  });
  page.on('pageerror', err => report.pageErrors.push({ bucket, text: String(err), stack: err?.stack || '' }));
  page.on('requestfailed', req => report.requestFailures.push({ bucket, url: req.url(), failure: req.failure()?.errorText || 'failed' }));
}

async function pageMetrics(page) {
  return page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    bodyTextLength: document.body?.innerText?.length || 0,
    guideVisible: !!document.querySelector('.fl-guide-launch'),
    membershipPresent: !!document.querySelector('#membership-payment-panel'),
    premiumPresent: !!document.querySelector('#premium-analysis-panel'),
    navPresent: !!document.querySelector('.nav-links'),
  }));
}

async function elementState(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { present: false };
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      present: true,
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      hiddenAttr: el.hidden,
      ariaHidden: el.getAttribute('aria-hidden'),
    };
  }, selector);
}

async function openGuideAndAsk(page, bucket) {
  const launch = page.locator('.fl-guide-launch');
  report[bucket].guideLaunchCount = await launch.count();
  if (!await launch.count()) return;
  await launch.first().click({ force: true });
  await page.waitForTimeout(300);
  report[bucket].guidePanelOpen = await page.locator('.fl-guide-panel.open').count() > 0;
  await page.screenshot({ path: `${outDir}/${bucket}-guide-open.png`, fullPage: false });

  const input = page.locator('.fl-guide-input');
  if (await input.count()) {
    await input.fill('Nasıl ödeme yaparım?');
    await page.locator('.fl-guide-send').click({ force: true });
    await page.waitForTimeout(700);
    report[bucket].guideText = (await page.locator('.fl-guide-log').innerText()).slice(-1800);
    report[bucket].guidePaymentAnswerOk = /Ödeme için|Havale|EFT|FAST|FL-/i.test(report[bucket].guideText);
    await page.screenshot({ path: `${outDir}/${bucket}-guide-answer.png`, fullPage: false });
  }
}

async function visitDesktop() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  attachDiagnostics(page, 'desktop');
  try {
    const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(7000);
    report.desktop.status = response?.status() || null;
    report.desktop.finalUrl = page.url();
    report.desktop.title = await page.title();
    report.desktop.metrics = await pageMetrics(page);
    await page.screenshot({ path: `${outDir}/desktop-top.png`, fullPage: false });
    await page.screenshot({ path: `${outDir}/desktop-full.png`, fullPage: true });

    await openGuideAndAsk(page, 'desktop');

    report.desktop.membershipBefore = await elementState(page, '#membership-payment-panel');
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('fl:open-panel', { detail: { id: 'membership-payment-panel', scroll: true } })));
    await page.waitForTimeout(500);
    report.desktop.membershipAfterOpen = await elementState(page, '#membership-payment-panel');
    if (report.desktop.membershipAfterOpen.present && report.desktop.membershipAfterOpen.height > 0) {
      await page.evaluate(() => document.querySelector('#membership-payment-panel')?.scrollIntoView({ block: 'start' }));
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${outDir}/desktop-membership.png`, fullPage: false });
    }
  } catch (error) {
    report.desktop.fatal = String(error?.stack || error);
  } finally {
    await context.close();
  }
}

async function visitMobile() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  attachDiagnostics(page, 'mobile');
  try {
    const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(7000);
    report.mobile.status = response?.status() || null;
    report.mobile.finalUrl = page.url();
    report.mobile.title = await page.title();
    report.mobile.metrics = await pageMetrics(page);
    await page.screenshot({ path: `${outDir}/mobile-top.png`, fullPage: false });
    await page.screenshot({ path: `${outDir}/mobile-full.png`, fullPage: true });

    await openGuideAndAsk(page, 'mobile');
    const panelBox = await page.locator('.fl-guide-panel').boundingBox().catch(() => null);
    report.mobile.guidePanelBox = panelBox;
    report.mobile.guideFitsViewport = !!panelBox && panelBox.x >= -1 && panelBox.x + panelBox.width <= 391 && panelBox.y >= -1 && panelBox.y + panelBox.height <= 845;
    report.mobile.membershipState = await elementState(page, '#membership-payment-panel');
  } catch (error) {
    report.mobile.fatal = String(error?.stack || error);
  } finally {
    await context.close();
  }
}

await visitDesktop();
await visitMobile();

report.finishedAt = new Date().toISOString();
await fs.writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2));
const d = report.desktop.metrics || {};
const m = report.mobile.metrics || {};
const summary = [
  '# External Visual Smoke Test',
  '',
  `Target: ${target}`,
  `Desktop HTTP: ${report.desktop.status ?? 'n/a'}`,
  `Mobile HTTP: ${report.mobile.status ?? 'n/a'}`,
  `Desktop guide: ${report.desktop.guidePanelOpen ? 'PASS' : 'FAIL'}`,
  `Desktop guide payment answer: ${report.desktop.guidePaymentAnswerOk ? 'PASS' : 'FAIL'}`,
  `Mobile guide: ${report.mobile.guidePanelOpen ? 'PASS' : 'FAIL'}`,
  `Mobile guide payment answer: ${report.mobile.guidePaymentAnswerOk ? 'PASS' : 'FAIL'}`,
  `Mobile guide fits viewport: ${report.mobile.guideFitsViewport ? 'PASS' : 'FAIL'}`,
  `Desktop horizontal overflow: ${d.horizontalOverflow ? 'YES' : 'NO'}`,
  `Mobile horizontal overflow: ${m.horizontalOverflow ? 'YES' : 'NO'}`,
  `Desktop membership height before/open: ${report.desktop.membershipBefore?.height ?? 'n/a'} / ${report.desktop.membershipAfterOpen?.height ?? 'n/a'}`,
  `Console errors: ${report.consoleErrors.length}`,
  `Page errors: ${report.pageErrors.length}`,
  `Request failures: ${report.requestFailures.length}`,
  report.desktop.fatal ? `Desktop fatal: ${report.desktop.fatal}` : '',
  report.mobile.fatal ? `Mobile fatal: ${report.mobile.fatal}` : '',
].filter(Boolean).join('\n');
await fs.writeFile(`${outDir}/summary.md`, summary);
console.log(summary);
console.log('\nREPORT_JSON_START');
console.log(JSON.stringify(report, null, 2));
console.log('REPORT_JSON_END');
await browser.close();

if (!report.desktop.status || report.desktop.status >= 400 || !report.mobile.status || report.mobile.status >= 400) process.exitCode = 1;
