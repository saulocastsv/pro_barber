// API: Consultar métricas financeiras
import { NextRequest } from 'next/server';
import { financialRepository } from '../../../../repositories/financialRepository';
import * as metrics from '../../../../services/financialMetrics';

export async function GET(req: NextRequest, { params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId;
  const transactions = await financialRepository.getTransactionsByTenant(tenantId);
  const appointments = await financialRepository.getAppointmentsByTenant(tenantId);
  const subscriptions = await financialRepository.getSubscriptionsByTenant(tenantId);
  // Calcula métricas principais
  const receitaBruta = metrics.receitaBruta(transactions);
  const receitaLiquida = metrics.receitaLiquida(transactions);
  const margemPercentual = metrics.margemPercentual(transactions);
  const ticketMedio = metrics.ticketMedioGlobal(appointments);
  const mrr = metrics.mrr(subscriptions);
  return Response.json({ receitaBruta, receitaLiquida, margemPercentual, ticketMedio, mrr });
}
