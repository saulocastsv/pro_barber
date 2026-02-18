// Interface base para módulos de insight automático
import { Insight } from '../domain/entities';

export interface InsightContext {
  tenantId: string;
  appointments: any[];
  transactions: any[];
  customers: any[];
  professionals: any[];
  services: any[];
  products: any[];
  subscriptions: any[];
  costs: any[];
  now: Date;
}

export interface InsightResult {
  id: string;
  name: string;
  category: string;
  description: string;
  priority: number;
  cooldown: number; // em horas
  threshold: number;
  status: 'active' | 'resolved' | 'ignored';
  createdAt: Date;
  data?: any;
}

export interface IInsightModule {
  id: string;
  name: string;
  category: string;
  description: string;
  evaluate(context: InsightContext): boolean;
  generate(context: InsightContext): InsightResult;
}
