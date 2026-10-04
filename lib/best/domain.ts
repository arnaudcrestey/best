export type BestInput = { nom: string; prenom: string; email: string; description: string };
export type BestDraft = {
  statut: 'orientation' | 'precision_necessaire' | 'verification_necessaire';
  accroche: string;
  paragraphes: string[];
  cloture: string;
  references: { file_id: string; repere: string; filename: string }[];
};
export type BestMail = { to: string; subject: string; text: string; html: string };
export class BestError extends Error {
  constructor(public code: string, public status = 503) { super(code); }
}

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BestError('invalid_response');
  return value as Record<string, unknown>;
}

export function validateInput(value: unknown): BestInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BestError('invalid_input', 400);
  const data = record(value);
  if (data.consent !== true) throw new BestError('consent_required', 400);
  if (data.website) throw new BestError('invalid_input', 400);
  if (Object.keys(data).some(key => !['nom', 'prenom', 'email', 'description', 'consent', 'website'].includes(key))) {
    throw new BestError('invalid_input', 400);
  }
  const field = (key: string, max: number, required = false) => {
    const value = data[key] ?? '';
    if (typeof value !== 'string') throw new BestError('invalid_input', 400);
    const text = value.trim().normalize('NFC').replace(/\r\n?/g, '\n');
    if ((required && !text) || text.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) throw new BestError('invalid_input', 400);
    return text;
  };
  const email = field('email', 254, true);
  if (!/^[A-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i.test(email)) throw new BestError('invalid_email', 400);
  return { nom: field('nom', 150), prenom: field('prenom', 150), email, description: field('description', 12000, true) };
}

export const responseSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    statut: { type: 'string', enum: ['orientation', 'precision_necessaire', 'verification_necessaire'] },
    accroche: { type: 'string' },
    paragraphes: { type: 'array', items: { type: 'string' } },
    cloture: { type: 'string' },
    references: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      properties: { file_id: { type: 'string' }, repere: { type: 'string' } },
      required: ['file_id', 'repere'],
    } },
  },
  required: ['statut', 'accroche', 'paragraphes', 'cloture', 'references'],
};

export function parseOpenAI(value: unknown): BestDraft {
  const response = record(value);
  if (response.status !== 'completed' || response.error || response.incomplete_details || !Array.isArray(response.output)) throw new BestError('incomplete_response');
  const output = response.output.map(record);
  if (output.some(part => !['reasoning', 'file_search_call', 'message'].includes(String(part.type)))) throw new BestError('unexpected_tool');
  const searches = output.filter(part => part.type === 'file_search_call');
  if (!searches.length || searches.some(part => part.status !== 'completed' || !Array.isArray(part.results))) throw new BestError('documents_unavailable');
  const documents = new Map<string, string>();
  for (const search of searches) {
    for (const value of search.results as unknown[]) {
      const item = record(value);
      if (typeof item.file_id === 'string' && typeof item.filename === 'string' && typeof item.text === 'string' && item.text.trim()) documents.set(item.file_id, item.filename);
    }
  }
  const messages = output.filter(part => part.type === 'message');
  if (messages.length !== 1 || messages[0].role !== 'assistant' || messages[0].status !== 'completed' || !Array.isArray(messages[0].content)) throw new BestError('missing_response');
  const content = messages[0].content.map(record);
  if (content.length !== 1 || content[0].type !== 'output_text' || typeof content[0].text !== 'string') throw new BestError('response_refused');
  let result: Record<string, unknown>;
  try { result = record(JSON.parse(content[0].text)); } catch { throw new BestError('invalid_response'); }
  if (Object.keys(result).sort().join(',') !== 'accroche,cloture,paragraphes,references,statut') throw new BestError('invalid_response');
  if (!['orientation', 'precision_necessaire', 'verification_necessaire'].includes(String(result.statut))) throw new BestError('invalid_response');
  if (!Array.isArray(result.paragraphes) || result.paragraphes.length < 1 || result.paragraphes.length > 3) throw new BestError('invalid_response');
  const texts = [result.accroche, ...result.paragraphes, result.cloture];
  if (texts.some(text => typeof text !== 'string' || !text.trim() || text.length > 2500)) throw new BestError('invalid_response');
  const body = texts.join('\n\n');
  if (body.length > 6000 || /Bien à vous|Arnaud\s+CRESTEY|demande@arnaudcrestey\.com|www\.arnaudcrestey\.com|Nouvelle demande BEST/i.test(body)) throw new BestError('invalid_response');
  if (!Array.isArray(result.references) || result.references.length > 6) throw new BestError('invalid_reference');
  if (result.statut === 'orientation' && (!documents.size || !result.references.length)) throw new BestError('missing_reference');
  const references = result.references.map(value => {
    const ref = record(value);
    if (Object.keys(ref).sort().join(',') !== 'file_id,repere' || typeof ref.file_id !== 'string' || !documents.has(ref.file_id) || typeof ref.repere !== 'string' || !ref.repere.trim() || ref.repere.length > 300) throw new BestError('invalid_reference');
    return { file_id: ref.file_id, repere: ref.repere.trim(), filename: documents.get(ref.file_id)! };
  });
  return { statut: result.statut as BestDraft['statut'], accroche: (result.accroche as string).trim(), paragraphes: (result.paragraphes as string[]).map(p => p.trim()), cloture: (result.cloture as string).trim(), references };
}

export function renderMail(input: BestInput, draft: BestDraft): BestMail {
  if (draft.statut === 'verification_necessaire') throw new BestError('human_review_required');
  const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const paragraphs = [draft.accroche, ...draft.paragraphes, draft.cloture];
  const sources = Array.from(new Set(draft.references.map(ref => `${ref.filename} — ${ref.repere}`)));
  const signature = 'Bien à vous,\nArnaud CRESTEY\nCommunication & stratégie digitale\ndemande@arnaudcrestey.com\nwww.arnaudcrestey.com';
  return {
    to: input.email, subject: 'Votre première orientation BEST',
    text: paragraphs.join('\n\n') + (sources.length ? '\n\nDocuments consultés :\n' + sources.join('\n') : '') + '\n\n' + signature,
    html: `<div lang="fr" style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6;max-width:680px;margin:0 auto;padding:24px;"><div style="border:1px solid #e5e7eb;border-radius:16px;padding:28px;background:#fff;"><h2 style="margin:0 0 18px;color:#0f172a;">Votre première orientation BEST</h2>${paragraphs.map(p => `<p style="margin:0 0 16px;">${escape(p).replace(/\n/g, '<br>')}</p>`).join('')}${sources.length ? `<div style="font-size:12px;color:#4b5563;margin:20px 0;"><strong>Documents consultés</strong><br>${sources.map(escape).join('<br>')}</div>` : ''}<p style="margin:24px 0 0;">Bien à vous,<br><strong>Arnaud CRESTEY</strong><br>Communication &amp; stratégie digitale<br><a href="mailto:demande@arnaudcrestey.com">demande@arnaudcrestey.com</a><br><a href="https://www.arnaudcrestey.com">www.arnaudcrestey.com</a></p></div></div>`,
  };
}
