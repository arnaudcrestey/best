import { BestError } from './domain';
import type { AIConfig } from './openai';

export type BestConfig = {
  mode: 'draft' | 'live';
  ai: AIConfig;
  origin: string;
  dailyLimit: number;
  smtp?: { host: string; port: number; user: string; pass: string; from: string; copy: string; replyTo: string };
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): BestConfig {
  const mode = env.BEST_AUTOMATION_MODE;
  if (!['draft', 'live'].includes(mode || '') || env.BEST_AI_ENABLED !== 'true') throw new BestError('service_unavailable');
  const required = (name: string) => {
    const value = env[name]?.trim();
    if (!value) throw new BestError('service_unavailable');
    return value;
  };
  const url = (name: string) => {
    try {
      const value = new URL(required(name));
      if (value.protocol !== 'https:' || value.username || value.password || value.search || value.hash || value.pathname !== '/') throw new Error();
      return value.origin;
    } catch { throw new BestError('service_unavailable'); }
  };
  // Protection de démonstration LOCALE : ni quota global ni plafond de dépenses.
  const dailyLimit = Number(env.BEST_DEMO_INSTANCE_DAILY_LIMIT || '20');
  if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 20) throw new BestError('service_unavailable');
  const vectorStore = required('OPENAI_VECTOR_STORE_ID');
  if (!/^vs_[A-Za-z0-9]+$/.test(vectorStore)) throw new BestError('service_unavailable');
  const config: BestConfig = {
    mode: mode as BestConfig['mode'], origin: url('BEST_SITE_ORIGIN'),
    ai: { key: required('OPENAI_API_KEY'), model: required('OPENAI_MODEL'), vectorStore },
    dailyLimit,
  };
  if (mode === 'live') {
    if (env.BEST_EMAIL_ENABLED !== 'true') throw new BestError('service_unavailable');
    const port = Number(required('SMTP_PORT'));
    if (![465, 587].includes(port)) throw new BestError('service_unavailable');
    const address = (name: string) => {
      const value = required(name);
      if (!/^[^\s<>(),;:@]+@[^\s<>(),;:@]+\.[^\s<>(),;:@]+$/.test(value)) throw new BestError('service_unavailable');
      return value;
    };
    config.smtp = {
      host: required('SMTP_HOST'), port, user: required('SMTP_USER'), pass: required('SMTP_PASS'),
      from: address('MAIL_FROM'), copy: address('MAIL_TO'), replyTo: address('BEST_REPLY_TO'),
    };
  }
  return config;
}
