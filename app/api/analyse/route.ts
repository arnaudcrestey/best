import nodemailer from "nodemailer";

type ContactBody = {
  nom?: string;
  prenom?: string;
  email?: string;
  description?: string;
};

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }

  return value;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactBody;

    const nom = body.nom?.trim() || "Non renseigné";
    const prenom = body.prenom?.trim() || "Non renseigné";
    const email = body.email?.trim() || "Non renseigné";
    const description = body.description?.trim() || "Non renseignée";

    const smtpHost = getEnv("SMTP_HOST");
    const smtpPort = Number(getEnv("SMTP_PORT"));
    const smtpUser = getEnv("SMTP_USER");
    const smtpPass = getEnv("SMTP_PASS");
    const mailFrom = getEnv("MAIL_FROM");
    const mailTo = getEnv("MAIL_TO");

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      replyTo: email !== "Non renseigné" ? email : undefined,
      subject: "Nouvelle demande BEST",
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.6; max-width: 700px; margin: 0 auto; padding: 24px;">
          <h2 style="margin: 0 0 24px; font-size: 24px; color: #111827;">Nouvelle demande BEST</h2>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 14px; font-size: 18px; color: #111827;">Informations</h3>
            <p style="margin: 0 0 8px;"><strong>Nom :</strong> ${escapeHtml(nom)}</p>
            <p style="margin: 0 0 8px;"><strong>Prénom :</strong> ${escapeHtml(prenom)}</p>
            <p style="margin: 0;"><strong>Email :</strong> ${escapeHtml(email)}</p>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
            <h3 style="margin: 0 0 14px; font-size: 18px; color: #111827;">Description</h3>
            <p style="margin: 0; white-space: pre-line;">${escapeHtml(description)}</p>
          </div>
        </div>
      `,
    });

    return Response.json(
      {
        success: true,
        result:
          "Votre demande a bien été envoyée. Nous reviendrons vers vous rapidement.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur envoi email BEST :", error);

    return Response.json(
      {
        success: false,
        result: "Une erreur est survenue lors de l'envoi.",
      },
      { status: 500 }
    );
  }
}
