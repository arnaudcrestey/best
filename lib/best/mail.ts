import nodemailer from 'nodemailer';
import type { BestConfig } from './config';
import { BestError, BestMail } from './domain';

export async function sendBestMail(mail: BestMail, id: string, config: NonNullable<BestConfig['smtp']>) {
  // L'ancien filtre n8n cherche cette chaîne dans le HTML, pas uniquement dans l'objet.
  if (mail.html.includes('Nouvelle demande BEST')) throw new BestError('legacy_trigger_guard');
  const transport = nodemailer.createTransport({
    host: config.host, port: config.port, secure: config.port === 465, requireTLS: true,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 15000,
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    disableFileAccess: true, disableUrlAccess: true,
  });
  try {
    const result = await transport.sendMail({
      from: config.from, to: mail.to, bcc: config.copy, replyTo: config.replyTo,
      subject: mail.subject, text: mail.text, html: mail.html,
      messageId: `<best-${id}@${config.from.split('@')[1]}>`,
      headers: { 'Auto-Submitted': 'auto-replied', 'X-Auto-Response-Suppress': 'All' },
    });
    const accepted = (result.accepted || []).map(value => (typeof value === 'string' ? value : value.address).toLowerCase());
    return { customerAccepted: accepted.includes(mail.to.toLowerCase()), copyAccepted: accepted.includes(config.copy.toLowerCase()) };
  } catch { throw new BestError('delivery_unconfirmed'); }
  finally { transport.close(); }
}
