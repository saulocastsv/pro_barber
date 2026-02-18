// Engine de forecast financeiro para 30/60/90 dias
// Função pura, testável, sem dependência de banco/framework
import { Appointment, Subscription } from '../domain/entities';

export interface ForecastInput {
  futureAppointments: Appointment[]; // agendados para o futuro
  pastAppointments: Appointment[];   // realizados no passado
  subscriptions: Subscription[];
  dias: number; // 30, 60, 90
}

export interface ForecastResult {
  period: string;
  projectedRevenue: number;
  details: any;
}

/**
 * Projeta faturamento futuro considerando:
 * - Agenda futura (appointments agendados)
 * - Taxa histórica de cancelamento
 * - Frequência média dos clientes
 * - Assinaturas ativas
 * Pesos:
 * - 60% agenda futura (ajustada pela taxa de cancelamento)
 * - 30% média histórica (últimos 90 dias)
 * - 10% assinaturas ativas
 */
export function forecastFaturamento({ futureAppointments, pastAppointments, subscriptions, dias }: ForecastInput): ForecastResult {
  // Receita prevista da agenda futura
  const receitaFutura = futureAppointments.reduce((acc, a) => acc + a.value, 0);
  // Taxa de cancelamento histórica
  const totalPassados = pastAppointments.length;
  const cancelados = pastAppointments.filter(a => a.status === 'cancelled').length;
  const taxaCancelamento = totalPassados > 0 ? cancelados / totalPassados : 0;
  // Receita média histórica (últimos 90 dias)
  const receitaHistorica = pastAppointments.reduce((acc, a) => acc + (a.status === 'done' ? a.value : 0), 0);
  const diasHistorico = 90;
  const receitaMediaDiaria = receitaHistorica / diasHistorico;
  // Receita prevista por assinaturas
  const receitaAssinaturas = subscriptions.filter(s => s.status === 'active').reduce((acc, s) => acc + s.price, 0) * (dias / 30);
  // Projeção ponderada
  const receitaAgendaAjustada = receitaFutura * (1 - taxaCancelamento);
  const receitaHistoricaProjecao = receitaMediaDiaria * dias;
  const receitaProjetada = receitaAgendaAjustada * 0.6 + receitaHistoricaProjecao * 0.3 + receitaAssinaturas * 0.1;
  return {
    period: `${dias}d`,
    projectedRevenue: receitaProjetada,
    details: {
      receitaAgendaAjustada,
      receitaHistoricaProjecao,
      receitaAssinaturas,
      taxaCancelamento
    }
  };
}
