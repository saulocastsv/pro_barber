// Entidades e tipos puros do domínio financeiro
// Não dependem de framework, ORM ou banco

export type UUID = string;

export interface Tenant {
  id: UUID;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface Customer {
  id: UUID;
  tenantId: UUID;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
}

export interface Professional {
  id: UUID;
  tenantId: UUID;
  name: string;
  email?: string;
  createdAt: Date;
}

export interface Service {
  id: UUID;
  tenantId: UUID;
  name: string;
  price: number;
  duration: number; // minutos
  active: boolean;
}

export interface Product {
  id: UUID;
  tenantId: UUID;
  name: string;
  price: number;
  cost: number;
  stock: number;
  active: boolean;
}

export type AppointmentStatus = 'scheduled' | 'done' | 'cancelled';

export interface Appointment {
  id: UUID;
  tenantId: UUID;
  customerId: UUID;
  professionalId: UUID;
  serviceId: UUID;
  date: Date;
  status: AppointmentStatus;
  value: number;
  cost?: number;
  createdAt: Date;
}

export type TransactionType = 'income' | 'cost' | 'transfer';

export interface FinancialTransaction {
  id: UUID;
  tenantId: UUID;
  appointmentId?: UUID;
  type: TransactionType;
  value: number;
  description?: string;
  createdAt: Date;
  costId?: UUID;
}

export type SubscriptionStatus = 'active' | 'cancelled';

export interface Subscription {
  id: UUID;
  tenantId: UUID;
  customerId: UUID;
  plan: string;
  price: number;
  status: SubscriptionStatus;
  startedAt: Date;
  endedAt?: Date;
}

export type CostType = 'fixed' | 'variable';

export interface Cost {
  id: UUID;
  tenantId: UUID;
  name: string;
  value: number;
  type: CostType;
  dueDate?: Date;
  paid: boolean;
}

export type InsightStatus = 'active' | 'resolved' | 'ignored';

export interface Insight {
  id: UUID;
  tenantId: UUID;
  name: string;
  category: string;
  description: string;
  status: InsightStatus;
  createdAt: Date;
  resolvedAt?: Date;
  data?: any;
}

export interface Forecast {
  id: UUID;
  tenantId: UUID;
  period: '30d' | '60d' | '90d';
  value: number;
  createdAt: Date;
  data?: any;
}
