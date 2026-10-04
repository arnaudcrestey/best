import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { BestError, BestInput } from './domain';

export type JobStatus = 'processing' | 'review' | 'sending' | 'sent' | 'uncertain';
// Aucun nom, email, description ni brouillon dans le cache de démonstration.
export type BestJob = {
  id: string; createdAt: string; status: JobStatus; errorCode?: string; copyAccepted?: boolean;
};
export interface BestStore {
  reserve(input: BestInput, client: string): Promise<{ fresh: boolean; job: BestJob }>;
  save(job: BestJob, expected: JobStatus): Promise<void>;
  get(id: string): Promise<BestJob | null>;
}

const RETENTION_MS = 24 * 3600000;
const MAX_RECORDS = 200;

/**
 * Site témoin seulement. Mémoire volatile, NON partagée entre instances Vercel.
 * Un redémarrage / déploiement / autre instance perd cette protection locale.
 * Ce cache ne garantit ni l'envoi unique global ni un plafond de dépenses.
 */
export class DemoMemoryStore implements BestStore {
  private readonly secret = randomBytes(32);
  private readonly jobs = new Map<string, { job: BestJob; expiresAt: number; fingerprint: string }>();
  private readonly fingerprints = new Map<string, string>();
  private readonly counters = new Map<string, { count: number; expiresAt: number }>();

  constructor(private dailyLimit: number, private clock: () => number = Date.now) {
    if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 20) throw new BestError('service_unavailable');
  }
  private hash(value: string) { return createHmac('sha256', this.secret).update(value).digest('hex'); }
  private prune(now: number) {
    for (const [id, entry] of this.jobs) {
      if (entry.expiresAt <= now) { this.jobs.delete(id); this.fingerprints.delete(entry.fingerprint); }
    }
    for (const [key, entry] of this.counters) if (entry.expiresAt <= now) this.counters.delete(key);
  }
  async reserve(input: BestInput, client: string) {
    const now = this.clock();
    this.prune(now);
    const fingerprint = this.hash(JSON.stringify({ nom: input.nom, prenom: input.prenom, email: input.email.toLowerCase(), description: input.description }));
    const previousId = this.fingerprints.get(fingerprint);
    const previous = previousId ? this.jobs.get(previousId) : undefined;
    if (previous) return { fresh: false, job: { ...previous.job } };

    const hour = Math.floor(now / 3600000), day = Math.floor(now / 86400000);
    const counters = [
      { key: `ip:${hour}:${this.hash(client)}`, limit: 5, expiresAt: (hour + 1) * 3600000 },
      { key: `email:${hour}:${this.hash(input.email.toLowerCase())}`, limit: 3, expiresAt: (hour + 1) * 3600000 },
      { key: `day:${day}`, limit: this.dailyLimit, expiresAt: (day + 1) * 86400000 },
    ];
    if (this.jobs.size >= MAX_RECORDS || counters.some(({ key, limit }) => (this.counters.get(key)?.count || 0) >= limit)) throw new BestError('rate_limited', 429);
    const job: BestJob = { id: randomUUID(), createdAt: new Date(now).toISOString(), status: 'processing' };
    // Aucun await entre le contrôle et la réservation : atomique dans CE processus seulement.
    this.jobs.set(job.id, { job, expiresAt: now + RETENTION_MS, fingerprint });
    this.fingerprints.set(fingerprint, job.id);
    for (const { key, expiresAt } of counters) this.counters.set(key, { count: (this.counters.get(key)?.count || 0) + 1, expiresAt });
    return { fresh: true, job: { ...job } };
  }
  async save(job: BestJob, expected: JobStatus) {
    this.prune(this.clock());
    const entry = this.jobs.get(job.id);
    if (!entry || entry.job.status !== expected) throw new BestError('storage_conflict');
    // Copier seulement les métadonnées, même si un appelant transmet des champs supplémentaires.
    entry.job = { id: entry.job.id, createdAt: entry.job.createdAt, status: job.status,
      ...(job.errorCode ? { errorCode: job.errorCode } : {}),
      ...(typeof job.copyAccepted === 'boolean' ? { copyAccepted: job.copyAccepted } : {}),
    };
  }
  async get(id: string) {
    this.prune(this.clock());
    const entry = this.jobs.get(id);
    return entry ? { ...entry.job } : null;
  }
}

let current: { limit: number; store: DemoMemoryStore } | undefined;
export function getDemoStore(dailyLimit: number): DemoMemoryStore {
  if (!current || current.limit !== dailyLimit) current = { limit: dailyLimit, store: new DemoMemoryStore(dailyLimit) };
  return current.store;
}
