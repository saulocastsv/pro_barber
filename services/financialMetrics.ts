// Serviços financeiros: cálculos e métricas puras
// Não dependem de framework ou banco
import { Appointment, FinancialTransaction, Cost, Subscription, Service, Professional, Customer } from '../domain/entities';

// Receita bruta: soma de todas as transações de receita
export function receitaBruta(transactions: FinancialTransaction[]): number {
  return transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
}

// Receita líquida: receita bruta - custos
export function receitaLiquida(transactions: FinancialTransaction[]): number {
  const receita = receitaBruta(transactions);
  const custos = transactions.filter(t => t.type === 'cost').reduce((acc, t) => acc + t.value, 0);
  return receita - custos;
}

// Margem absoluta
export function margemAbsoluta(transactions: FinancialTransaction[]): number {
  return receitaLiquida(transactions);
}

// Margem percentual
export function margemPercentual(transactions: FinancialTransaction[]): number {
  const receita = receitaBruta(transactions);
  if (receita === 0) return 0;
  return (receitaLiquida(transactions) / receita) * 100;
}

// Ticket médio global
export function ticketMedioGlobal(appointments: Appointment[]): number {
  if (appointments.length === 0) return 0;
  const total = appointments.reduce((acc, a) => acc + a.value, 0);
  return total / appointments.length;
}

// Ticket médio por cliente
export function ticketMedioPorCliente(appointments: Appointment[], customerId: string): number {
  const doCliente = appointments.filter(a => a.customerId === customerId);
  if (doCliente.length === 0) return 0;
  return doCliente.reduce((acc, a) => acc + a.value, 0) / doCliente.length;
}

// Ticket médio por profissional
export function ticketMedioPorProfissional(appointments: Appointment[], professionalId: string): number {
  const doProf = appointments.filter(a => a.professionalId === professionalId);
  if (doProf.length === 0) return 0;
  return doProf.reduce((acc, a) => acc + a.value, 0) / doProf.length;
}

// Margem por hora (total margem / total horas trabalhadas)
export function margemPorHora(appointments: Appointment[], services: Service[]): number {
  let totalMargem = 0;
  let totalMinutos = 0;
  for (const a of appointments) {
    const serv = services.find(s => s.id === a.serviceId);
    if (!serv) continue;
    totalMargem += (a.value - (a.cost || 0));
    totalMinutos += serv.duration;
  }
  if (totalMinutos === 0) return 0;
  return totalMargem / (totalMinutos / 60);
}

// Ocupação da agenda (total de minutos agendados / total possível)
export function ocupacaoAgenda(appointments: Appointment[], periodoMinutos: number, profissionais: Professional[], servicos: Service[]): number {
  // periodoMinutos: minutos disponíveis no período analisado (ex: 30 dias * 8h * n profissionais)
  let minutosAgendados = 0;
  for (const a of appointments) {
    const serv = servicos.find(s => s.id === a.serviceId);
    if (!serv) continue;
    minutosAgendados += serv.duration;
  }
  if (periodoMinutos === 0) return 0;
  return (minutosAgendados / periodoMinutos) * 100;
}

// LTV (Lifetime Value): ticket médio * frequência média * tempo de retenção (em meses)
export function ltv(ticketMedio: number, frequenciaMensal: number, mesesRetencao: number): number {
  return ticketMedio * frequenciaMensal * mesesRetencao;
}

// MRR (Monthly Recurring Revenue): soma das assinaturas ativas
export function mrr(subscriptions: Subscription[]): number {
  return subscriptions.filter(s => s.status === 'active').reduce((acc, s) => acc + s.price, 0);
}

// Capacidade ociosa: 100 - ocupação da agenda
export function capacidadeOciosa(ocupacao: number): number {
  return 100 - ocupacao;
}
