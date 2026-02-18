// Repositório financeiro desacoplado (Prisma)
// Pronto para troca de banco (Supabase)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const financialRepository = {
  async getTransactionsByTenant(tenantId: string) {
    return prisma.financialTransaction.findMany({ where: { tenantId } });
  },
  async getAppointmentsByTenant(tenantId: string) {
    return prisma.appointment.findMany({ where: { tenantId } });
  },
  async getSubscriptionsByTenant(tenantId: string) {
    return prisma.subscription.findMany({ where: { tenantId } });
  },
  async getCustomersByTenant(tenantId: string) {
    return prisma.customer.findMany({ where: { tenantId } });
  },
  async getProfessionalsByTenant(tenantId: string) {
    return prisma.professional.findMany({ where: { tenantId } });
  },
  async getServicesByTenant(tenantId: string) {
    return prisma.service.findMany({ where: { tenantId } });
  },
  async getProductsByTenant(tenantId: string) {
    return prisma.product.findMany({ where: { tenantId } });
  },
  async getCostsByTenant(tenantId: string) {
    return prisma.cost.findMany({ where: { tenantId } });
  },
  async saveInsight(insight: any) {
    return prisma.insight.create({ data: insight });
  },
  async listActiveInsights(tenantId: string) {
    return prisma.insight.findMany({ where: { tenantId, status: 'active' } });
  },
  async resolveInsight(id: string) {
    return prisma.insight.update({ where: { id }, data: { status: 'resolved', resolvedAt: new Date() } });
  }
};
