const assert = require('node:assert/strict');
const { mkdir } = require('node:fs/promises');
const { chromium } = require(process.env.BEST_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BEST_TEST_URL || 'http://127.0.0.1:3211';

(async () => {
  await mkdir('.test-build', { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.BEST_BROWSER_CHANNEL ? { channel: process.env.BEST_BROWSER_CHANNEL } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
  const fill = async () => {
    await page.goto(base + '/formulaire');
    await page.locator('[name=prenom]').fill('Camille');
    await page.locator('[name=email]').fill('camille@example.test');
    await page.locator('[name=description]').fill('Demande fictive réservée au test local.');
    await page.locator('[name=consent]').check();
  };
  try {
    await fill();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: '.test-build/formulaire-mobile.png', fullPage: true });
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click();
    await page.getByRole('alert').waitFor();
    assert.match(await page.getByRole('alert').innerText(), /indisponible/);
    assert.match(await page.locator('[name=description]').inputValue(), /fictive/);
    console.log('OK formulaire mobile : pas de débordement, erreur réelle 503, champs conservés.');

    for (const status of ['sent', 'review', 'pending']) {
      let calls = 0;
      await page.route(base + '/api/analyse', async route => {
        calls++;
        const body = route.request().postDataJSON();
        assert.equal(body.consent, true);
        assert.equal(body.website, '');
        await new Promise(resolve => setTimeout(resolve, 80));
        await route.fulfill({ status: status === 'sent' ? 200 : 202, contentType: 'application/json', body: JSON.stringify({ status, reference: 'reference-test-local', message: 'Message de contrôle local, aucun email réel.' }) });
      });
      await fill();
      await page.evaluate(() => {
        const form = document.querySelector('form');
        form.requestSubmit();
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
      await page.getByText('Informations utiles', { exact: true }).waitFor();
      assert.equal(calls, 1);
      assert.equal(await page.getByText('reference-test-local', { exact: true }).count(), 0);
      assert.equal((await page.locator('body').innerText()).includes('Référence à conserver'), false);
      const title = await page.locator('h1').innerText();
      assert.equal(title.includes('a bien été envoyée'), status === 'sent');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: `.test-build/formulaire-${status}.png`, fullPage: true });
      await page.unroute(base + '/api/analyse');
      console.log(`OK état ${status} : un seul appel malgré deux soumissions, message cohérent.`);
    }
    await page.route(base + '/api/analyse', route => route.abort('failed'));
    await fill();
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click();
    await page.getByRole('alert').waitFor();
    assert.match(await page.getByRole('alert').innerText(), /peut-être été prise en compte/);
    assert.equal(await page.locator('[name=email]').inputValue(), 'camille@example.test');
    assert.equal(await page.getByRole('button', { name: 'Vérifiez votre boîte email' }).isDisabled(), true);
    await page.unroute(base + '/api/analyse');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await fill();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: '.test-build/formulaire-desktop.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log('OK réseau interrompu, bureau et absence d’erreur JavaScript.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
