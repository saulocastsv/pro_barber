// Insight: Margem Baixa
import { IInsightModule, InsightContext, InsightResult } from './InsightBase';
import { v4 as uuidv4 } from 'uuid';

export const MargemInsight: IInsightModule = {
  id: 'margem-baixa',
  name: 'Margem Baixa',
  category: 'Financeiro',
  description: 'A margem líquida está abaixo do ideal. Reveja custos e precificação.',
  evaluate(context: InsightContext) {
    // Lógica: margem líquida < 20%
    const receitas = context.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
    const custos = context.transactions.filter(t => t.type === 'cost').reduce((acc, t) => acc + t.value, 0);
    if (receitas === 0) return false;
    const margem = (receitas - custos) / receitas * 100;
    return margem < 20;
  },
  generate(context: InsightContext): InsightResult {
    const receitas = context.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
    const custos = context.transactions.filter(t => t.type === 'cost').reduce((acc, t) => acc + t.value, 0);
    const margem = receitas === 0 ? 0 : (receitas - custos) / receitas * 100;
    return {
      id: uuidv4(),
      name: this.name,
      category: this.category,
      description: `${this.description} Margem atual: ${margem.toFixed(1)}%` ,
      priority: 9,
      cooldown: 24,
      threshold: 20,
      status: 'active',
      createdAt: new Date(),
      data: { margem }
    };
  }
};
