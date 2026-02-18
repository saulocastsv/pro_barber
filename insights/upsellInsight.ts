// Insight: Oportunidade de Upsell
import { IInsightModule, InsightContext, InsightResult } from './InsightBase';
import { v4 as uuidv4 } from 'uuid';

export const UpsellInsight: IInsightModule = {
  id: 'upsell',
  name: 'Oportunidade de Upsell',
  category: 'Financeiro',
  description: 'Clientes com ticket médio próximo ao mínimo. Sugerir combos ou serviços adicionais.',
  evaluate(context: InsightContext) {
    // Lógica: clientes com ticket médio entre 35 e 45
    const clientes = context.customers;
    for (const c of clientes) {
      const doCliente = context.appointments.filter(a => a.customerId === c.id);
      if (doCliente.length === 0) continue;
      const ticket = doCliente.reduce((acc, a) => acc + a.value, 0) / doCliente.length;
      if (ticket >= 35 && ticket < 45) return true;
    }
    return false;
  },
  generate(context: InsightContext): InsightResult {
    const clientes = context.customers.map(c => {
      const doCliente = context.appointments.filter(a => a.customerId === c.id);
      if (doCliente.length === 0) return null;
      const ticket = doCliente.reduce((acc, a) => acc + a.value, 0) / doCliente.length;
      if (ticket >= 35 && ticket < 45) {
        return { id: c.id, nome: c.name, ticket };
      }
      return null;
    }).filter(Boolean);
    return {
      id: uuidv4(),
      name: this.name,
      category: this.category,
      description: `${this.description} Clientes: ${clientes.map(c => c.nome).join(', ')}`,
      priority: 8,
      cooldown: 24,
      threshold: 1,
      status: 'active',
      createdAt: new Date(),
      data: { clientes }
    };
  }
};
