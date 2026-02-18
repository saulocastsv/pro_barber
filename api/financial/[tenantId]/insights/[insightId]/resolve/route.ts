// API: Marcar insight como resolvido
import { NextRequest } from 'next/server';
import { financialRepository } from '../../../../../repositories/financialRepository.ts';

export async function POST(req: NextRequest, { params }: { params: { tenantId: string, insightId: string } }) {
  const { insightId } = params;
  await financialRepository.resolveInsight(insightId);
  return Response.json({ ok: true });
}
