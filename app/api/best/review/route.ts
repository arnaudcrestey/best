export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

// Le site témoin n'a plus de journal privé. Ne pas présenter le cache comme un dossier.
export async function GET() {
  return Response.json({ message: 'Le site témoin ne conserve pas de dossier ni de journal de relecture.' }, { status: 410, headers });
}
