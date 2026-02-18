// Job para processar insights automaticamente (cron/evento)
import { financialRepository } from '../repositories/financialRepository';
import { allInsights } from '../insights/insightModules';

export async function processInsights(tenantId: string) {
  // Carrega contexto
  const [appointments, transactions, customers, professionals, services, products, subscriptions, costs] = await Promise.all([
    financialRepository.getAppointmentsByTenant(tenantId),
    financialRepository.getTransactionsByTenant(tenantId),
    financialRepository.getCustomersByTenant(tenantId),
    financialRepository.getProfessionalsByTenant(tenantId),
    financialRepository.getServicesByTenant(tenantId),
    financialRepository.getProductsByTenant(tenantId),
    financialRepository.getSubscriptionsByTenant(tenantId),
    financialRepository.getCostsByTenant(tenantId)
  ]);
  const context = {
    tenantId,
    appointments,
    transactions,
    customers,
    professionals,
    services,
    products,
    subscriptions,
    costs,
    now: new Date()
  };
  // Executa todos os módulos de insight
  for (const mod of allInsights) {
    if (mod.evaluate(context)) {
      const result = mod.generate(context);
      await financialRepository.saveInsight(result);
    }
  }
}
