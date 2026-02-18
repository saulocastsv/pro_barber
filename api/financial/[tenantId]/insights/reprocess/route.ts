// API: Forçar reprocessamento de insights
import { NextRequest } from 'next/server';
import { processInsights } from '../../../../jobs/insightJob';

export async function POST(req: NextRequest, { params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  await processInsights(tenantId);
  return Response.json({ ok: true });
}
