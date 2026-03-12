import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await resend.emails.send({
      from: "BEST <onboarding@resend.dev>",
      to: "arnaud.crestey14@gmail.com",
      subject: "Nouvelle demande BEST",
      html: `
        <h2>Nouvelle demande BEST</h2>

        <p><b>Nom :</b> ${body.nom || "Non renseigné"}</p>
        <p><b>Prénom :</b> ${body.prenom || "Non renseigné"}</p>
        <p><b>Email :</b> ${body.email}</p>

        <h3>Description</h3>
        <p>${body.description}</p>
      `,
    });

    return Response.json({
      result:
        "Votre demande a bien été envoyée. Nous reviendrons vers vous rapidement.",
    });
  } catch (error) {
    console.error(error);

    return Response.json({
      result: "Une erreur est survenue lors de l'envoi.",
    });
  }
}
