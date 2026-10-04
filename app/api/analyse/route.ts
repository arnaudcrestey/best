import { loadConfig } from '../../../lib/best/config';
import { BestError, validateInput } from '../../../lib/best/domain';
import { generateDraft } from '../../../lib/best/openai';
import { sendBestMail } from '../../../lib/best/mail';
import { processBest } from '../../../lib/best/service';
import { getDemoStore } from '../../../lib/best/store';

export const runtime = 'nodejs';
export const maxDuration = 120;
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

async function readBody(req: Request): Promise<unknown> {
  if (!req.headers.get('content-type')?.startsWith('application/json')) throw new BestError('invalid_input', 415);
  if (Number(req.headers.get('content-length')) > 65536) throw new BestError('invalid_input', 413);
  const reader = req.body?.getReader();
  if (!reader) throw new BestError('invalid_input', 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 65536) { await reader.cancel(); throw new BestError('invalid_input', 413); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    if (error instanceof BestError) throw error;
    throw new BestError('invalid_input', 400);
  } finally { reader.releaseLock(); }
}

export async function POST(req: Request) {
  try {
    const config = loadConfig();
    if (req.headers.get('origin') !== config.origin) throw new BestError('origin_not_allowed', 403);
    const input = validateInput(await readBody(req));
    // Vercel réécrit cet en-tête ; ailleurs le quota commun évite de faire confiance à une IP librement fournie.
    const client = process.env.VERCEL === '1' ? (req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'shared') : 'shared';
    const result = await processBest(input, client, config.mode, {
      store: getDemoStore(config.dailyLimit),
      generate: input => generateDraft(input, config.ai),
      send: (mail, id) => {
        if (!config.smtp) throw new BestError('service_unavailable');
        return sendBestMail(mail, id, config.smtp);
      },
    });
    return Response.json(result, { status: result.status === 'sent' ? 200 : 202, headers });
  } catch (error) {
    const known = error instanceof BestError ? error : new BestError('service_unavailable');
    const message = known.status === 429
      ? 'Le nombre de demandes autorisé est atteint. Veuillez réessayer plus tard. Pour une première information juridique, vous pouvez contacter un Point-justice.'
      : known.status < 500 ? 'Vérifiez les champs du formulaire et votre accord avant de réessayer.'
      : 'Le service de réponse est momentanément indisponible. Un Point-justice peut vous aider à obtenir une première information juridique sur votre situation.';
    // Ni contenu salarié, ni clé, ni détail fournisseur dans les logs ou la réponse.
    return Response.json({ status: 'error', message }, { status: known.status, headers });
  }
}
