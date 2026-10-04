const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateInput, parseOpenAI, renderMail, BestError } = require('../.test-build/lib/best/domain');
const { buildAIRequest, generateDraft } = require('../.test-build/lib/best/openai');
const { loadConfig } = require('../.test-build/lib/best/config');
const { processBest } = require('../.test-build/lib/best/service');
const { DemoMemoryStore, getDemoStore } = require('../.test-build/lib/best/store');
const { POST } = require('../.test-build/app/api/analyse/route');
const { GET: review } = require('../.test-build/app/api/best/review/route');
const { sendBestMail } = require('../.test-build/lib/best/mail');
const nodemailer = require('nodemailer');

// Rendu réel du JSX de confirmation avec un résultat injecté, sans réseau ni navigateur.
function renderConfirmation(status) {
  const fs = require('node:fs');
  const path = require('node:path');
  const ts = require('typescript');
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const source = fs.readFileSync(path.join(__dirname, '../app/formulaire/page.tsx'), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const result = { status, reference: 'reference-test-interne', message: 'Texte technique avec cette référence.' };
  const module = { exports: {} };
  const load = name => name === 'react'
    ? { ...React, useState: initial => React.useState(initial === null ? result : initial) }
    : name === '../../components/best/SiteShell' ? { default: ({ children }) => children } : require(name);
  new Function('require', 'module', 'exports', code)(load, module, module.exports);
  return renderToStaticMarkup(React.createElement(module.exports.default));
}

for (const status of ['sent', 'review', 'pending']) {
  test(`confirmation ${status} keeps the original presentation without a visible reference`, () => {
    const html = renderConfirmation(status);
    assert.match(html, /rounded-\[28px\]/);
    assert.match(html, /Merci pour votre/);
    assert.doesNotMatch(html, /reference-test-interne|Référence à conserver|avec cette référence|Texte technique/);
    assert.doesNotMatch(html, /Notre équipe reviendra/);
    assert.match(html, /ne remplace pas un avocat/);
    if (status === 'sent') {
      assert.match(html, /Demande transmise/);
      assert.match(html, /Votre demande a bien été envoyée/);
      assert.match(html, /Pensez à vérifier votre boîte email/);
    } else {
      assert.doesNotMatch(html, /Votre demande a bien été envoyée/);
      assert.doesNotMatch(html, /demande@arnaudcrestey.com|écrivez-nous|contactez-nous/);
      assert.match(html, /Point-justice/);
      assert.match(html, /https:\/\/www.service-public.gouv.fr\/particuliers\/vosdroits\/F20706/);
      assert.match(html, status === 'review' ? /Aucun email automatique/ : /Ne renvoyez pas votre demande/);
    }
  });
}

// Aucun test ne doit pouvoir appeler un fournisseur réel.
global.fetch = async () => { throw new Error('Network forbidden in offline tests'); };
const form = { nom: 'Exemple', prenom: 'Camille', email: 'camille@example.test', description: 'Mon employeur ne répond pas à ma demande écrite.', consent: true, website: '' };
const input = validateInput(form);
const draftJSON = { statut: 'orientation', accroche: 'Merci pour votre message.', paragraphes: ['Gardez une copie de vos échanges.'], cloture: 'Un juriste en Point-justice peut vous aider à examiner vos échanges. Préparez quelques dates pour ce premier rendez-vous.', references: [{ file_id: 'file-test', repere: 'Section de test' }] };
function aiResponse(draft = draftJSON) {
  return { status: 'completed', output: [
    { type: 'file_search_call', status: 'completed', results: [{ file_id: 'file-test', filename: 'Document de test.pdf', text: 'Extrait exclusivement fictif pour test technique.' }] },
    { type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: JSON.stringify(draft) }] },
  ] };
}
const draft = parseOpenAI(aiResponse());
const config = { key: 'fake-key-for-offline-test', model: 'model-for-offline-test', vectorStore: 'vs_test' };
const env = {
  BEST_AUTOMATION_MODE: 'draft', BEST_AI_ENABLED: 'true', BEST_SITE_ORIGIN: 'https://best.example.test',
  OPENAI_API_KEY: config.key, OPENAI_MODEL: config.model, OPENAI_VECTOR_STORE_ID: config.vectorStore,
  BEST_DEMO_INSTANCE_DAILY_LIMIT: '20',
};
class MemoryStore {
  job; saves = []; failAt;
  async reserve(input) {
    if (this.job) return { fresh: false, job: structuredClone(this.job) };
    this.job = { id: 'a1234567-1234-4123-8123-123456789012', createdAt: new Date().toISOString(), status: 'processing', input };
    return { fresh: true, job: structuredClone(this.job) };
  }
  async save(job, expected) {
    this.saves.push(job.status);
    if (job.status === this.failAt || expected !== this.job.status) throw new BestError('storage_unavailable');
    this.job = structuredClone(job);
  }
  async get() { return this.job; }
}
function harness(overrides = {}) {
  const store = new MemoryStore();
  let generations = 0, sends = 0;
  const dependencies = {
    store,
    generate: async () => { generations++; return draft; },
    send: async (mail) => { sends++; assert.equal(store.job.status, 'sending'); assert.equal(mail.to, input.email); return { customerAccepted: true, copyAccepted: true }; },
    ...overrides,
  };
  return { store, dependencies, counts: () => [generations, sends] };
}

test('validates form and keeps destination independent from generated text', () => {
  assert.equal(input.email, form.email);
  assert.equal(renderMail(input, draft).to, form.email);
});
for (const [name, changes] of Object.entries({
  consent: { consent: false }, honeypot: { website: 'spam' }, recipient: { email: 'a@example.test,b@example.test' },
  header: { email: 'x@example.test\r\nBcc:a@example.test' }, extra: { model: 'injected' },
  empty: { description: '  ' }, oversized: { description: 'x'.repeat(12001) }, type: { description: {} },
})) test(`rejects invalid input: ${name}`, () => assert.throws(() => validateInput({ ...form, ...changes }), BestError));
test('rejects null input with client error', () => assert.throws(() => validateInput(null), e => e.status === 400));
test('normalizes unicode and whitespace', () => assert.equal(validateInput({ ...form, prenom: '  E\u0301lodie ' }).prenom, 'Élodie'));

test('configuration defaults to off and never selects a paid model implicitly', () => {
  assert.throws(() => loadConfig({}), BestError);
  assert.throws(() => loadConfig({ ...env, OPENAI_MODEL: '' }), BestError);
  assert.equal(loadConfig(env).mode, 'draft');
});
test('live mode requires explicit email activation and full SMTP config', () => {
  assert.throws(() => loadConfig({ ...env, BEST_AUTOMATION_MODE: 'live' }), BestError);
  assert.throws(() => loadConfig({ ...env, BEST_AUTOMATION_MODE: 'live', BEST_EMAIL_ENABLED: 'true' }), BestError);
  const smtp = { SMTP_HOST: 'smtp.example.test', SMTP_PORT: '465', SMTP_USER: 'user', SMTP_PASS: 'fake', MAIL_FROM: 'best@example.test', MAIL_TO: 'copy@example.test', BEST_REPLY_TO: 'help@example.test' };
  assert.equal(loadConfig({ ...env, ...smtp, BEST_AUTOMATION_MODE: 'live', BEST_EMAIL_ENABLED: 'true' }).smtp.copy, smtp.MAIL_TO);
  assert.throws(() => loadConfig({ ...env, ...smtp, BEST_AUTOMATION_MODE: 'live', BEST_EMAIL_ENABLED: 'true', MAIL_TO: 'copy@example.test,evil@example.test' }));
});
test('open demo requires no storage, access code or recipient list', () => {
  const settings = loadConfig(env);
  assert.equal(settings.redis, undefined);
  assert.equal(settings.demo, undefined);
  assert.equal(settings.dailyLimit, 20);
  const { BEST_DEMO_INSTANCE_DAILY_LIMIT, ...minimal } = env;
  assert.equal(loadConfig(minimal).dailyLimit, 20);
});
for (const changes of [{ BEST_DEMO_INSTANCE_DAILY_LIMIT: '0' }, { BEST_DEMO_INSTANCE_DAILY_LIMIT: '21' }, { BEST_DEMO_INSTANCE_DAILY_LIMIT: 'NaN' }, { BEST_SITE_ORIGIN: 'https://best.example.test/path' }, { OPENAI_VECTOR_STORE_ID: 'invalid' }]) {
  test(`rejects incomplete/unsafe configuration ${Object.keys(changes)[0]}=${Object.values(changes)[0]}`, () => assert.throws(() => loadConfig({ ...env, ...changes }), BestError));
}
test('request uses Responses, library, schema, bounded output and only useful personal data', () => {
  const body = buildAIRequest(input, config);
  assert.equal(body.store, false);
  assert.equal(body.tool_choice, 'required');
  assert.deepEqual(body.tools[0].vector_store_ids, ['vs_test']);
  assert.equal(body.text.format.strict, true);
  assert.equal(body.max_output_tokens, 4000);
  assert.ok(!JSON.stringify(body).includes(input.email));
  assert.ok(!body.input[0].content[0].text.includes(input.nom));
});
test('AI adapter posts only to Responses endpoint and validates before returning', async () => {
  let calls = 0;
  const result = await generateDraft(input, config, async (url, options) => {
    calls++; assert.equal(url, 'https://api.openai.com/v1/responses'); assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Authorization, `Bearer ${config.key}`);
    return Response.json(aiResponse());
  });
  assert.equal(result.statut, 'orientation'); assert.equal(calls, 1);
});
test('AI failures never retry or leak provider body', async () => {
  let count = 0;
  await assert.rejects(generateDraft(input, config, async () => { count++; return new Response('private-provider-secret', { status: 429 }); }), e => e.code === 'ai_unavailable' && !e.message.includes('private'));
  assert.equal(count, 1);
  await assert.rejects(generateDraft(input, config, async () => { throw new Error('private key'); }), e => e.code === 'ai_connection_uncertain');
});
const malformed = {
  incomplete: r => { r.status = 'incomplete'; }, missingSearch: r => { r.output.shift(); },
  unfinishedSearch: r => { r.output[0].status = 'in_progress'; },
  missingResults: r => { r.output[0].results = null; },
  refusal: r => { r.output[1].content = [{ type: 'refusal', refusal: 'No' }]; },
  unexpectedTool: r => { r.output.push({ type: 'function_call' }); },
  wrongRole: r => { r.output[1].role = 'user'; },
  invalidJSON: r => { r.output[1].content[0].text = 'not JSON'; },
};
for (const [name, change] of Object.entries(malformed)) test(`holds unsafe AI response: ${name}`, () => { const response = aiResponse(); change(response); assert.throws(() => parseOpenAI(response), BestError); });
for (const [name, change] of Object.entries({
  unknownRef: { references: [{ file_id: 'file-other', repere: 'invented' }] }, noRef: { references: [] },
  longBody: { paragraphes: ['x'.repeat(3000)] }, tooManyWords: { paragraphes: ['mot '.repeat(221)] }, manyParagraphs: { paragraphes: ['a', 'b', 'c', 'd'] },
  signature: { cloture: 'Bien à vous, Arnaud CRESTEY' }, extraField: { to: 'evil@example.test' },
  oldTrigger: { paragraphes: ['Nouvelle demande BEST'] },
})) test(`holds invalid draft: ${name}`, () => assert.throws(() => parseOpenAI(aiResponse({ ...draftJSON, ...change })), BestError));
test('questions can request missing information without fabricated references', () => assert.equal(parseOpenAI(aiResponse({ ...draftJSON, statut: 'precision_necessaire', references: [] })).references.length, 0));
for (const paragraph of [
  'Dans quel pays travaillez-vous ?',
  'Vous pouvez répondre à cet e-mail avec ces précisions.',
  'Répondez à ce courriel après votre rendez-vous.',
  'Contactez-nous si vous avez une question.',
  'Écrivez-moi pour poursuivre.',
  'Vous pouvez nous transmettre votre contrat.',
  'Merci de me tenir informé des suites.',
  'Revenez vers nous après ce premier échange.',
  'Je reste à votre disposition.',
]) test(`does not send a country question or a BEST follow-up: ${paragraph}`, () => {
  assert.throws(() => parseOpenAI(aiResponse({ ...draftJSON, paragraphes: [paragraph] })), e => e.code === 'invalid_response');
});
test('closing must name an outside contact rather than invite further questions', () => {
  assert.throws(() => parseOpenAI(aiResponse({ ...draftJSON, cloture: "N'hésitez pas à poser d'autres questions." })), BestError);
});
for (const cloture of [
  'Un avocat en droit du travail peut examiner vos pièces : prenez rendez-vous avec votre contrat.',
  'Un juriste dans un Point-justice peut vous aider à clarifier les prochaines démarches.',
  'Vous pouvez demander un rendez-vous au médecin du travail pour parler des effets de cette situation sur votre santé.',
  'Un syndicat de votre administration peut vous accompagner pour préparer vos démarches.',
  'Prenez contact avec votre représentant du personnel pour préparer un premier échange.',
]) test(`accepts an appropriate outside closing: ${cloture}`, () => {
  assert.equal(parseOpenAI(aiResponse({ ...draftJSON, cloture })).cloture, cloture);
});
test('allows employer correspondence and an explicit cross-border situation, not a BEST follow-up', () => {
  const paragraph = 'Pour votre emploi en Belgique, préparez votre contrat pour un juriste local. Conservez une copie avant de répondre à votre employeur.';
  assert.equal(parseOpenAI(aiResponse({ ...draftJSON, paragraphes: [paragraph] })).paragraphes[0], paragraph);
});
test('mail escapes HTML and adds signature exactly once', () => {
  const mail = renderMail(input, { ...draft, accroche: '<img src=x onerror=alert(1)>' });
  assert.ok(mail.html.includes('&lt;img')); assert.ok(!mail.html.includes('<img'));
  assert.equal(mail.text.match(/Arnaud CRESTEY/g).length, 1);
  assert.ok(!mail.html.includes('file-test'));
  assert.ok(!mail.html.includes('Nouvelle demande BEST'));
});
test('mail presents a greeting, source references, personal closing and one signature in reading order', () => {
  const mail = renderMail(input, draft);
  assert.match(mail.text, /^Bonjour Camille,\n\n/);
  assert.ok(mail.text.indexOf(draft.accroche) < mail.text.indexOf(draft.paragraphes[0]));
  assert.ok(mail.text.indexOf('Repères utilisés') < mail.text.indexOf(draft.cloture));
  assert.ok(mail.text.indexOf(draft.cloture) < mail.text.indexOf('Bien à vous,'));
  assert.match(mail.html, /role="presentation"/);
  assert.equal(mail.html.match(/Arnaud CRESTEY/g).length, 1);
  assert.equal(mail.to, input.email);
});
test('mail greeting supports no first name and safely escapes names with markup', () => {
  assert.match(renderMail({ ...input, prenom: '' }, draft).text, /^Bonjour,\n\n/);
  const mail = renderMail({ ...input, prenom: '<img src=x onerror=alert(1)>' }, draft);
  assert.ok(!mail.html.includes('<img'));
  assert.ok(mail.html.includes('Bonjour &lt;img'));
});
test('review-required draft cannot be rendered for automatic sending', () => assert.throws(() => renderMail(input, { ...draft, statut: 'verification_necessaire' }), BestError));

test('live flow tracks local send-lock before one SMTP send', async () => {
  const h = harness();
  assert.equal((await processBest(input, 'ip', 'live', h.dependencies)).status, 'sent');
  assert.deepEqual(h.store.saves, ['review', 'sending', 'sent']);
  await processBest(input, 'ip', 'live', h.dependencies);
  assert.deepEqual(h.counts(), [1, 1]);
});
test('simultaneous double submissions share one generation and one send', async () => {
  const h = harness();
  const results = await Promise.all(Array.from({ length: 12 }, () => processBest(input, 'ip', 'live', h.dependencies)));
  assert.equal(new Set(results.map(r => r.reference)).size, 1);
  assert.deepEqual(h.counts(), [1, 1]);
});
test('draft mode generates but never sends, including later switch to live', async () => {
  const h = harness();
  assert.equal((await processBest(input, 'ip', 'draft', h.dependencies)).status, 'review');
  await processBest(input, 'ip', 'live', h.dependencies);
  assert.deepEqual(h.counts(), [1, 0]);
});
test('unverified legal reply stays held even in live mode', async () => {
  const h = harness({ generate: async () => ({ ...draft, statut: 'verification_necessaire' }) });
  assert.equal((await processBest(input, 'ip', 'live', h.dependencies)).status, 'review');
  assert.equal(h.counts()[1], 0);
});
test('review does not promise a saved file or retained draft', async () => {
  const h = harness({ generate: async () => ({ ...draft, statut: 'verification_necessaire' }) });
  const result = await processBest(input, 'ip', 'live', h.dependencies);
  assert.match(result.message, /ne conserve pas de dossier/);
  assert.match(result.message, /Point-justice/);
  assert.doesNotMatch(result.message, /demande@arnaudcrestey.com|écrivez-nous|contactez-nous/);
  assert.equal(h.store.job.draft, undefined);
  assert.equal(h.counts()[1], 0);
});
test('storage outage before claim blocks all AI and SMTP calls', async () => {
  const h = harness(); h.store.reserve = async () => { throw new BestError('storage_unavailable'); };
  await assert.rejects(processBest(input, 'ip', 'live', h.dependencies)); assert.deepEqual(h.counts(), [0, 0]);
});
for (const stage of ['review', 'sending']) test(`failed storage at ${stage} blocks sending`, async () => {
  const h = harness(); h.store.failAt = stage;
  assert.equal((await processBest(input, 'ip', 'live', h.dependencies)).status, 'pending');
  await processBest(input, 'ip', 'live', h.dependencies); assert.deepEqual(h.counts(), [1, 0]);
});
test('SMTP uncertainty never announces success or resends', async () => {
  let sends = 0;
  const h = harness({ send: async () => { sends++; throw new BestError('delivery_unconfirmed'); } });
  assert.equal((await processBest(input, 'ip', 'live', h.dependencies)).status, 'pending');
  await processBest(input, 'ip', 'live', h.dependencies); assert.equal(sends, 1);
});
test('missing customer acceptance is not success even if the copy was accepted', async () => {
  const h = harness({ send: async () => ({ customerAccepted: false, copyAccepted: true }) });
  assert.equal((await processBest(input, 'ip', 'live', h.dependencies)).status, 'pending');
});
test('copy rejection is recorded without resending accepted customer email', async () => {
  const h = harness({ send: async () => ({ customerAccepted: true, copyAccepted: false }) });
  assert.equal((await processBest(input, 'ip', 'live', h.dependencies)).status, 'sent');
  assert.equal(h.store.job.copyAccepted, false);
});
test('lost final storage acknowledgment does not send again', async () => {
  const h = harness(); h.store.failAt = 'sent';
  assert.equal((await processBest(input, 'ip', 'live', h.dependencies)).status, 'pending');
  await processBest(input, 'ip', 'live', h.dependencies); assert.deepEqual(h.counts(), [1, 1]);
});
test('AI error is retained without new paid attempt', async () => {
  let calls = 0;
  const h = harness({ generate: async () => { calls++; throw new BestError('incomplete_response'); } });
  await processBest(input, 'ip', 'live', h.dependencies); await processBest(input, 'ip', 'live', h.dependencies);
  assert.equal(calls, 1); assert.equal(h.counts()[1], 0);
});

test('demo cache retains metadata only, never form content or draft', async () => {
  const store = new DemoMemoryStore(20);
  const { job } = await store.reserve(input, '203.0.113.7');
  assert.equal(job.input, undefined);
  await store.save({ ...job, status: 'review', input, draft }, 'processing');
  const saved = await store.get(job.id);
  assert.equal(saved.input, undefined); assert.equal(saved.draft, undefined);
  const serialized = JSON.stringify({ jobs: [...store.jobs], fingerprints: [...store.fingerprints], counters: [...store.counters] });
  for (const personal of [input.email, input.description, input.nom, '203.0.113.7', draft.accroche]) assert.ok(!serialized.includes(personal));
  saved.status = 'sent';
  assert.equal((await store.get(job.id)).status, 'review');
});
test('real demo cache handles concurrent submissions in one instance', async () => {
  const store = new DemoMemoryStore(20);
  let generates = 0, sends = 0;
  const results = await Promise.all(Array.from({ length: 12 }, () => processBest(input, 'ip', 'live', {
    store, generate: async () => { generates++; return draft; },
    send: async () => { sends++; return { customerAccepted: true, copyAccepted: true }; },
  })));
  assert.equal(new Set(results.map(r => r.reference)).size, 1);
  assert.equal(generates, 1); assert.equal(sends, 1);
});
test('demo local email, IP and daily limits reject new requests but allow status replay', async () => {
  const emailStore = new DemoMemoryStore(20);
  for (let i = 0; i < 3; i++) await emailStore.reserve({ ...input, description: 'test-' + i }, 'ip-' + i);
  await assert.rejects(emailStore.reserve({ ...input, description: 'fourth' }, 'new-ip'), e => e.status === 429);
  const replay = await emailStore.reserve({ ...input, description: 'test-0' }, 'ip-0');
  assert.equal(replay.fresh, false);

  const ipStore = new DemoMemoryStore(20);
  for (let i = 0; i < 5; i++) await ipStore.reserve({ ...input, email: 'u' + i + '@example.test' }, 'same-ip');
  await assert.rejects(ipStore.reserve({ ...input, email: 'six@example.test' }, 'same-ip'), e => e.status === 429);

  const dailyStore = new DemoMemoryStore(1);
  await dailyStore.reserve(input, 'one');
  await assert.rejects(dailyStore.reserve({ ...input, email: 'another@example.test' }, 'two'), e => e.status === 429);
});
test('duplicate recipient casing does not bypass the local guard', async () => {
  const store = new DemoMemoryStore(20);
  const first = await store.reserve(input, 'ip');
  const again = await store.reserve({ ...input, email: input.email.toUpperCase() }, 'ip');
  assert.equal(again.fresh, false); assert.equal(again.job.id, first.job.id);
});
test('demo counters and metadata expire without retaining payloads', async () => {
  let now = Date.UTC(2026, 9, 4, 12);
  const store = new DemoMemoryStore(1, () => now);
  const { job } = await store.reserve(input, 'ip');
  await store.save({ ...job, status: 'sent' }, 'processing');
  now += 24 * 3600000;
  assert.equal(await store.get(job.id), null);
  assert.equal(store.jobs.size, 0); assert.equal(store.counters.size, 0);
  assert.equal((await store.reserve(input, 'ip')).fresh, true);
});
test('separate server instances do NOT promise cross-instance deduplication', async () => {
  const first = await new DemoMemoryStore(1).reserve(input, 'ip');
  const second = await new DemoMemoryStore(1).reserve(input, 'ip');
  assert.equal(first.fresh, true); assert.equal(second.fresh, true);
  assert.notEqual(first.job.id, second.job.id);
});
test('same loaded module reuses local guard, changing configuration resets it', () => {
  assert.equal(getDemoStore(20), getDemoStore(20));
  assert.notEqual(getDemoStore(19), getDemoStore(20));
  assert.throws(() => new DemoMemoryStore(0), BestError);
});
test('demo cache rejects stale state transitions', async () => {
  const store = new DemoMemoryStore(20);
  const { job } = await store.reserve(input, 'ip');
  await assert.rejects(store.save({ ...job, status: 'sent' }, 'sending'), e => e.code === 'storage_conflict');
  assert.equal((await store.get(job.id)).status, 'processing');
});

test('HTTP route is unavailable without activation; no raw error is exposed', async () => {
  const before = process.env.BEST_AUTOMATION_MODE; process.env.BEST_AUTOMATION_MODE = 'off';
  try {
    const response = await POST(new Request('https://best.example.test/api/analyse', { method: 'POST', body: '{}' }));
    assert.equal(response.status, 503); assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.json(); assert.equal(body.status, 'error'); assert.ok(!JSON.stringify(body).includes('OPENAI'));
    assert.match(body.message, /Point-justice/);
    assert.doesNotMatch(body.message, /demande@arnaudcrestey.com|écrivez-nous/);
  } finally { if (before === undefined) delete process.env.BEST_AUTOMATION_MODE; else process.env.BEST_AUTOMATION_MODE = before; }
});
test('HTTP route rejects cross-site, oversized, malformed and unconsented input before network', async () => {
  const previous = { ...process.env }; Object.assign(process.env, env);
  try {
    for (const [body, origin, contentType, expected] of [
      [JSON.stringify(form), 'https://evil.test', 'application/json', 403],
      ['{', env.BEST_SITE_ORIGIN, 'application/json', 400],
      [JSON.stringify(form), env.BEST_SITE_ORIGIN, 'text/plain', 415],
      ['x'.repeat(65537), env.BEST_SITE_ORIGIN, 'application/json', 413],
      [JSON.stringify({ ...form, consent: false }), env.BEST_SITE_ORIGIN, 'application/json', 400],
    ]) {
      const response = await POST(new Request(env.BEST_SITE_ORIGIN + '/api/analyse', { method: 'POST', headers: { origin, 'content-type': contentType }, body }));
      assert.equal(response.status, expected);
    }
  } finally { for (const key of Object.keys(env)) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } }
});
test('removed review endpoint exposes no journal or personal data', async () => {
  const response = await review(new Request('https://best.example.test/api/best/review'));
  assert.equal(response.status, 410);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match((await response.json()).message, /ne conserve pas/);
});

test('SMTP uses TLS, fixed copy/reply-to, safe content and closes connection', async () => {
  const original = nodemailer.createTransport;
  const smtp = { host: 'smtp.example.test', port: 587, user: 'test', pass: 'fake', from: 'best@example.test', copy: 'copy@example.test', replyTo: 'help@example.test' };
  let sent, closed = 0;
  nodemailer.createTransport = options => {
    assert.equal(options.requireTLS, true); assert.equal(options.tls.rejectUnauthorized, true);
    assert.equal(options.disableFileAccess, true); assert.equal(options.disableUrlAccess, true);
    return { sendMail: async message => { sent = message; return { accepted: [message.to, smtp.copy] }; }, close: () => closed++ };
  };
  try {
    const result = await sendBestMail(renderMail(input, draft), 'test-id', smtp);
    assert.equal(result.customerAccepted, true); assert.equal(result.copyAccepted, true);
    assert.equal(sent.to, input.email); assert.equal(sent.bcc, smtp.copy); assert.equal(sent.replyTo, smtp.replyTo);
    assert.equal(sent.headers['Auto-Submitted'], 'auto-replied'); assert.equal(closed, 1);
    await assert.rejects(sendBestMail({ ...renderMail(input, draft), html: 'Nouvelle demande BEST' }, 'test-id', smtp), e => e.code === 'legacy_trigger_guard');
  } finally { nodemailer.createTransport = original; }
});
test('SMTP timeout closes connection without leaking credentials or retrying', async () => {
  const original = nodemailer.createTransport; let attempts = 0, closed = 0;
  nodemailer.createTransport = () => ({ sendMail: async () => { attempts++; throw new Error('sensitive internal details'); }, close: () => closed++ });
  try {
    await assert.rejects(sendBestMail(renderMail(input, draft), 'test-id', { host: 'test', port: 465, user: 'test', pass: 'fake', from: 'best@example.test', copy: 'copy@example.test', replyTo: 'help@example.test' }), e => e.code === 'delivery_unconfirmed' && !e.message.includes('sensitive'));
    assert.equal(attempts, 1); assert.equal(closed, 1);
  } finally { nodemailer.createTransport = original; }
});
test('open HTTP handler uses real adapters with mocked network and no storage service', async () => {
  const previous = { ...process.env }, originalFetch = global.fetch, originalTransport = nodemailer.createTransport;
  const settings = { ...env, BEST_AUTOMATION_MODE: 'live', BEST_EMAIL_ENABLED: 'true', SMTP_HOST: 'smtp.example.test', SMTP_PORT: '465', SMTP_USER: 'test', SMTP_PASS: 'fake', MAIL_FROM: 'best@example.test', MAIL_TO: 'copy@example.test', BEST_REPLY_TO: 'help@example.test' };
  Object.assign(process.env, settings);
  let apiCalls = 0, emails = 0;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses', 'no Redis, n8n or other provider');
    apiCalls++;
    const body = JSON.parse(options.body);
    assert.deepEqual(body.tools[0].vector_store_ids, ['vs_test']);
    return Response.json(aiResponse());
  };
  nodemailer.createTransport = () => ({ sendMail: async message => {
    emails++; assert.ok(!message.html.includes('Nouvelle demande BEST'));
    return { accepted: [message.to, settings.MAIL_TO] };
  }, close: () => {} });
  const submit = body => POST(new Request(env.BEST_SITE_ORIGIN + '/api/analyse', {
    method: 'POST', headers: { origin: env.BEST_SITE_ORIGIN, 'content-type': 'application/json' }, body: JSON.stringify(body),
  }));
  try {
    const response = await submit(form);
    assert.equal(response.status, 200);
    const body = await response.json(); assert.equal(body.status, 'sent');
    assert.ok(!JSON.stringify(body).includes(input.email));
    assert.equal(apiCalls, 1); assert.equal(emails, 1);
    assert.equal((await submit(form)).status, 200);
    assert.equal(apiCalls, 1); assert.equal(emails, 1);

    // Aucune authentification ni liste blanche : une autre adresse valide est acceptée.
    const other = await submit({ ...form, email: 'second@example.test' });
    assert.equal(other.status, 200); assert.equal(apiCalls, 2); assert.equal(emails, 2);

    global.fetch = async () => { apiCalls++; return Response.json(aiResponse({ ...draftJSON, statut: 'verification_necessaire' })); };
    const held = await submit({ ...form, description: 'Situation fictive devant être vérifiée.' });
    assert.equal(held.status, 202); assert.equal((await held.json()).status, 'review');
    assert.equal(apiCalls, 3); assert.equal(emails, 2);

    global.fetch = async () => { apiCalls++; return new Response('private-provider-secret', { status: 500 }); };
    const uncertainForm = { ...form, email: 'third@example.test', description: 'Essai fictif de panne IA.' };
    const uncertain = await submit(uncertainForm);
    assert.equal(uncertain.status, 202); assert.equal((await uncertain.json()).status, 'pending');
    await submit(uncertainForm);
    assert.equal(apiCalls, 4); assert.equal(emails, 2);
  } finally {
    global.fetch = originalFetch; nodemailer.createTransport = originalTransport;
    for (const key of Object.keys(settings)) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
  }
});
