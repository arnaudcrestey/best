import { BestError, BestInput, parseOpenAI, responseSchema } from './domain';
import { bestInstructions } from './prompt';

export type AIConfig = { key: string; model: string; vectorStore: string };
export function buildAIRequest(input: BestInput, config: AIConfig) {
  return {
    model: config.model,
    instructions: bestInstructions + '\nDate de traitement : ' + new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'Europe/Paris' }).format(new Date()) + '.',
    input: [{ role: 'user', content: [{ type: 'input_text', text: JSON.stringify({ prenom: input.prenom, description: input.description, pieces_jointes_transmises: false }) }] }],
    tools: [{ type: 'file_search', vector_store_ids: [config.vectorStore], max_num_results: 8 }],
    tool_choice: 'required', include: ['file_search_call.results'], max_tool_calls: 2,
    text: { format: { type: 'json_schema', name: 'orientation_best', strict: true, schema: responseSchema } },
    max_output_tokens: 4000, store: false, background: false, stream: false,
  };
}

// Appel serveur uniquement. Aucun secret ou SDK OpenAI n'est importé par le client.
export async function generateDraft(input: BestInput, config: AIConfig, fetcher: typeof fetch = fetch) {
  let response: Response;
  try {
    response = await fetcher('https://api.openai.com/v1/responses', {
      method: 'POST', redirect: 'error', cache: 'no-store',
      headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(buildAIRequest(input, config)),
      signal: AbortSignal.timeout(60000),
    });
  } catch { throw new BestError('ai_connection_uncertain'); }
  if (!response.ok) throw new BestError('ai_unavailable');
  try { return parseOpenAI(await response.json()); } catch (error) {
    if (error instanceof BestError) throw error;
    throw new BestError('invalid_response');
  }
}
