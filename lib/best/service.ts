import { BestDraft, BestError, BestInput, BestMail, renderMail } from './domain';
import { BestJob, BestStore } from './store';

export type PublicResult = { status: 'sent' | 'review' | 'pending'; reference: string; message: string };
export function publicResult(job: BestJob): PublicResult {
  if (job.status === 'sent') return { status: 'sent', reference: job.id, message: 'Votre première orientation a été confiée au service de messagerie. Pensez à vérifier votre boîte email et vos courriers indésirables.' };
  if (job.status === 'review') return { status: 'review', reference: job.id, message: 'Aucune réponse automatique n’a été envoyée. Ce site témoin ne conserve pas de dossier à relire. Un Point-justice peut vous proposer une première information juridique pour examiner votre situation avec un professionnel.' };
  return { status: 'pending', reference: job.id, message: 'Le résultat du traitement n’est pas confirmé. Ne renvoyez pas votre demande : vérifiez votre boîte email. Pour un premier conseil juridique, vous pouvez contacter un Point-justice. Ce site témoin ne conserve pas de dossier.' };
}

export async function processBest(
  input: BestInput, client: string, mode: 'draft' | 'live',
  dependencies: {
    store: BestStore;
    generate: (input: BestInput) => Promise<BestDraft>;
    send: (mail: BestMail, id: string) => Promise<{ customerAccepted: boolean; copyAccepted: boolean }>;
  },
): Promise<PublicResult> {
  const { store, generate, send } = dependencies;
  const reservation = await store.reserve(input, client);
  let job = reservation.job;
  // Anti-doublon de démonstration : seulement tant que le même cache local existe.
  if (!reservation.fresh) return publicResult(job);
  try {
    const draft = await generate(input);
    const next: BestJob = { ...job, status: 'review' };
    await store.save(next, 'processing');
    job = next;
    if (mode === 'draft') return publicResult(job);
    if (draft.statut === 'verification_necessaire') {
      return publicResult(job);
    }
    const mail = renderMail(input, draft);
    const sending: BestJob = { ...job, status: 'sending' };
    // Verrou local AVANT SMTP. Une issue ambiguë interdit toute relance automatique.
    await store.save(sending, 'review');
    job = sending;
    const delivery = await send(mail, job.id);
    const finished: BestJob = {
      ...job, status: delivery.customerAccepted ? 'sent' : 'uncertain', copyAccepted: delivery.copyAccepted,
      ...(!delivery.customerAccepted ? { errorCode: 'customer_delivery_unconfirmed' } : {}),
    };
    await store.save(finished, 'sending');
    return publicResult(finished);
  } catch (error) {
    const held: BestJob = { ...job, status: 'uncertain', errorCode: error instanceof BestError ? error.code : 'processing_unconfirmed' };
    try { await store.save(held, job.status); } catch { /* Le verrou précédent reste bloquant : jamais de relance aveugle. */ }
    return publicResult(held);
  }
}
