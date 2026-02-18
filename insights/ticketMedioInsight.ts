// Insight: Ticket Médio
import { IInsightModule, InsightContext, InsightResult } from './InsightBase';
import { v4 as uuidv4 } from 'uuid';

export const TicketMedioInsight: IInsightModule = {
  id: 'ticket-medio',
  name: 'Ticket Médio Baixo',
  category: 'Financeiro',
  description: 'O ticket médio está abaixo do ideal. Considere estratégias de upsell ou combos.',
  evaluate(context: InsightContext) {
    // Lógica: ticket médio < threshold
    const total = context.appointments.reduce((acc, a) => acc + a.value, 0);
    const count = context.appointments.length;
    if (count === 0) return false;
    const ticketMedio = total / count;
    return ticketMedio < 35; // threshold exemplo
  },
  generate(context: InsightContext): InsightResult {
    const total = context.appointments.reduce((acc, a) => acc + a.value, 0);
    const count = context.appointments.length;
    const ticketMedio = count === 0 ? 0 : total / count;
    return {
      id: uuidv4(),
      name: this.name,
      category: this.category,
      description: `${this.description} Ticket médio atual: R$ ${ticketMedio.toFixed(2)}`,
      priority: 10,
      cooldown: 24,
      threshold: 35,
      status: 'active',
      createdAt: new Date(),
      data: { ticketMedio }
    };
  }
};
