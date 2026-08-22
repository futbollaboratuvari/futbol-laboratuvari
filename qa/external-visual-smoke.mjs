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

async function attachDiagnostics(page, bucket) {
  page.on('console', msg => {
    if (msg.type() === 'error') report.consoleErrors.push({ bucket, text: msg.text() });
  });
  page.on('pageerror', err => report.pageErrors.push({ bucket, text: String(err) }));
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

async function visitDesktop() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  attachDiagnostics(page, 'desktop');
  const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);
  report.desktop.status = response?.status() || null;
  report.desktop.finalUrl = page.url();
  report.desktop.title = await page.title();
  report.desktop.metrics = await pageMetrics(page);
  await page.screenshot({ path: `${outDir}/desktop-full.png`, fullPage: true });

  const membership = page.locator('#membership-payment-panel');
  report.desktop.membershipVisible = await membership.count() > 0;
  if (await membership.count()) {
    await membership.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outDir}/desktop-membership.png`, fullPage: false });
  }

  const launch = page.locator('.fl-guide-launch');
  report.desktop.guideLaunchCount = await launch.count();
  if (await launch.count()) {
    await launch.first().click();
    await page.waitForTimeout(300);
    report.desktop.guidePanelOpen = await page.locator('.fl-guide-panel.open').count() > 0;
    await page.screenshot({ path: `${outDir}/desktop-guide-open.png`, fullPage: false });

    const input = page.locator('.fl-guide-input');
    if (await input.count()) {
      await input.fill('Nasıl ödeme yaparım?');
      await page.locator('.fl-guide-send').click();
      await page.waitForTimeout(700);
      report.desktop.guideText = (await page.locator('.fl-guide-log').innerText()).slice(-1800);
      report.desktop.guidePaymentAnswerOk = /Ödeme için|Havale|EFT|FAST|FL-/i.test(report.desktop.guideText);
      await page.screenshot({ path: `${outDir}/desktop-guide-answer.png`, fullPage: false });
    }
  }
  await context.close();
}

async function visitMobile() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  attachDiagnostics(page, 'mobile');
  const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);
  report.mobile.status = response?.status() || null;
  report.mobile.finalUrl = page.url();
  report.mobile.title = await page.title();
  report.mobile.metrics = await pageMetrics(page);
  await page.screenshot({ path: `${outDir}/mobile-full.png`, fullPage: true });

  const launch = page.locator('.fl-guide-launch');
  report.mobile.guideLaunchCount = await launch.count();
  if (await launch.count()) {
    await launch.first().click();
    await page.waitForTimeout(300);
    report.mobile.guidePanelOpen = await page.locator('.fl-guide-panel.open').count() > 0;
    const panelBox = await page.locator('.fl-guide-panel').boundingBox();
    report.mobile.guidePanelBox = panelBox;
    report.mobile.guideFitsViewport = !!panelBox && panelBox.x >= -1 && panelBox.x + panelBox.width <= 391 && panelBox.y >= -1 && panelBox.y + panelBox.height <= 845;
    await page.screenshot({ path: `${outDir}/mobile-guide-open.png`, fullPage: false });
  }
  await context.close();
}

try {
  await visitDesktop();
  await visitMobile();
} catch (error) {
  report.fatal = String(error?.stack || error);
  process.exitCode = 1;
} finally {
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
    `Guide payment answer: ${report.desktop.guidePaymentAnswerOk ? 'PASS' : 'FAIL'}`,
    `Mobile guide fits viewport: ${report.mobile.guideFitsViewport ? 'PASS' : 'FAIL'}`,
    `Desktop horizontal overflow: ${d.horizontalOverflow ? 'YES' : 'NO'}`,
    `Mobile horizontal overflow: ${m.horizontalOverflow ? 'YES' : 'NO'}`,
    `Console errors: ${report.consoleErrors.length}`,
    `Page errors: ${report.pageErrors.length}`,
    `Request failures: ${report.requestFailures.length}`,
    report.fatal ? `Fatal: ${report.fatal}` : '',
  ].filter(Boolean).join('\n');
  await fs.writeFile(`${outDir}/summary.md`, summary);
  console.log(summary);
  console.log('\nREPORT_JSON_START');
  console.log(JSON.stringify(report, null, 2));
  console.log('REPORT_JSON_END');
  await browser.close();
}
