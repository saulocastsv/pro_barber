// API: Listar insights ativos
import { NextRequest } from 'next/server';
import { financialRepository } from '../../../../repositories/financialRepository';

export async function GET(req: NextRequest, { params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId;
  const insights = await financialRepository.listActiveInsights(tenantId);
  return Response.json(insights);
}
