/**
 * CALCULATIONS SERVICE
 * Centraliza toda a lógica financeira e de cálculos
 * Garante consistência entre componentes
 */

import { MembershipPlan, Service } from '@/types';
import { SERVICES, LOYALTY_RULES } from '@/constants';

// ============ MARGENS E CUSTOS ============

/**
 * Calcula a margem real levando em conta:
 * - Custo do serviço
 * - Overhead operacional (20% estimado)
 * - CAC (Customer Acquisition Cost)
 * - Custo de processamento de pagamento (2.5%)
 */
export function calculateRealMargin(
  price: number,
  cost: number,
  overheadPercentage: number = 0.20
): number {
  const overheadAmount = price * overheadPercentage;
  const processingCost = price * 0.025; // 2.5% card processing
  const totalCost = cost + overheadAmount + processingCost;
  
  if (price <= 0) return 0;
  return ((price - totalCost) / price) * 100;
}

/**
 * Calcula o preço mínimo para atingir uma margem desejada
 */
export function calculateMinPriceForMargin(
  cost: number,
  desiredMarginPercentage: number,
  overheadPercentage: number = 0.20
): number {
  // Fórmula inversa: price = cost / (1 - margin - overhead - processing)
  const totalPercentage = (desiredMarginPercentage / 100) + overheadPercentage + 0.025;
  return cost / (1 - totalPercentage);
}

/**
 * Calcula o LTV (Lifetime Value) de um cliente
 */
export function calculateLTV(
  avgMonthlySpend: number,
  avgLifetimeMonths: number = 24
): number {
  return avgMonthlySpend * avgLifetimeMonths;
}

/**
 * Calcula o CAC (Customer Acquisition Cost)
 */
export function calculateCAC(
  marketingSpend: number,
  newCustomersAcquired: number
): number {
  if (newCustomersAcquired <= 0) return 0;
  return marketingSpend / newCustomersAcquired;
}

/**
 * Calcula LTV:CAC Ratio (ideal > 3:1)
 */
export function calculateLTVtoCACRatio(ltv: number, cac: number): number {
  if (cac <= 0) return 0;
  return ltv / cac;
}

/**
 * Calcula Payback Period (meses até recuperar CAC)
 */
export function calculatePaybackPeriod(
  avgMonthlyContribution: number,
  cac: number
): number {
  if (avgMonthlyContribution <= 0) return Infinity;
  return cac / avgMonthlyContribution;
}

// ============ MÉTRICAS DE ASSINATURA ============

/**
 * Calcula MRR (Monthly Recurring Revenue)
 */
export function calculateMRR(activePlans: { price: number; activeMembers: number }[]): number {
  return activePlans.reduce((sum, plan) => sum + (plan.price * plan.activeMembers), 0);
}

/**
 * Calcula Churn Rate
 */
export function calculateChurnRate(customersLost: number, startingCustomers: number): number {
  if (startingCustomers <= 0) return 0;
  return (customersLost / startingCustomers) * 100;
}

/**
 * Calcula ARR (Annual Recurring Revenue)
 */
export function calculateARR(mrr: number): number {
  return mrr * 12;
}

/**
 * Calcula revenue de um plano com mais precisão
 */
export function calculatePlanRevenue(
  plan: MembershipPlan,
  churnRateMonthly: number = 0.02 // 2% default
): number {
  const activeMembers = plan.activeMembers;
  const monthlyRevenue = plan.price * activeMembers;
  
  // Aplica churn rate se relevante
  const adjustedMembers = activeMembers * (1 - churnRateMonthly);
  return monthlyRevenue * (1 - churnRateMonthly);
}

/**
 * Calcula metric de utilização real do plano
 */
export function calculatePlanUtilization(
  totalServicesIncluded: number,
  servicesUsedThisMonth: number
): number {
  if (totalServicesIncluded <= 0) return 0;
  return (servicesUsedThisMonth / totalServicesIncluded) * 100;
}

// ============ DESCONTO E PONTOS ============

/**
 * Calcula desconto por pontos acumulados
 */
export function calculatePointsDiscount(points: number): number {
  const discountInReais = (points / LOYALTY_RULES.DISCOUNT_CONVERSION_RATE);
  return discountInReais;
}

/**
 * Calcula pontos ganhos em uma compra/serviço
 */
export function calculatePointsEarned(amount: number): number {
  return Math.floor(amount * LOYALTY_RULES.POINTS_PER_CURRENCY);
}

/**
 * Valida se pode usar pontos
 */
export function canRedeemPoints(points: number): boolean {
  return points >= LOYALTY_RULES.MIN_POINTS_TO_REDEEM;
}

/**
 * Calcula preço final após aplicar desconto de pontos
 */
export function calculateFinalPriceWithPoints(
  originalPrice: number,
  pointsToUse: number,
  maxDiscountPercentage: number = 0.5
): { finalPrice: number; pointsUsed: number; discountApplied: number } {
  const maxDiscount = originalPrice * maxDiscountPercentage;
  const pointsDiscount = calculatePointsDiscount(pointsToUse);
  const discountApplied = Math.min(pointsDiscount, maxDiscount);
  
  return {
    finalPrice: Math.max(0, originalPrice - discountApplied),
    pointsUsed: Math.floor(discountApplied * LOYALTY_RULES.DISCOUNT_CONVERSION_RATE),
    discountApplied
  };
}

// ============ PREÇO COM ASSINATURA ============

/**
 * Calcula desconto para assinante
 */
export function calculateSubscriberDiscount(
  originalPrice: number,
  subscriptionBenefitPercentage: number = 0.15 // 15% default
): number {
  return originalPrice * subscriptionBenefitPercentage;
}

/**
 * Calcula preço final para assinante
 */
export function calculateSubscriberPrice(
  originalPrice: number,
  subscriptionBenefitPercentage: number = 0.15
): { finalPrice: number; discountAmount: number; savingsPercentage: number } {
  const discountAmount = calculateSubscriberDiscount(originalPrice, subscriptionBenefitPercentage);
  
  return {
    finalPrice: originalPrice - discountAmount,
    discountAmount,
    savingsPercentage: subscriptionBenefitPercentage * 100
  };
}

// ============ COMISSÃO PARA BARBEIRO ============

/**
 * Calcula comissão do barbeiro baseada em serviço
 */
export function calculateBarberCommission(
  bookingAmount: number,
  commissionRate: number = 0.5 // 50% default
): number {
  return bookingAmount * commissionRate;
}

/**
 * Calcula comissão ajustada se for assinante
 */
export function calculateAdjustedBarberCommission(
  bookingAmount: number,
  isSubscriberService: boolean = false,
  commissionRate: number = 0.5,
  subscriptionCommissionReduction: number = 0.1 // 10% reduction para subscription
): number {
  let commission = calculateBarberCommission(bookingAmount, commissionRate);
  
  if (isSubscriberService) {
    commission = commission * (1 - subscriptionCommissionReduction);
  }
  
  return commission;
}

/**
 * Calcula total de comissões para um mês
 */
export function calculateMonthlyBarberCommissions(
  appointments: Array<{ amount: number; isSubscriber?: boolean }>,
  commissionRate: number = 0.5
): { total: number; detail: Array<{ amount: number; commission: number }> } {
  const detail = appointments.map(apt => ({
    amount: apt.amount,
    commission: calculateAdjustedBarberCommission(apt.amount, apt.isSubscriber, commissionRate)
  }));
  
  return {
    total: detail.reduce((sum, d) => sum + d.commission, 0),
    detail
  };
}

// ============ FORECAST E PROJEÇÕES ============

/**
 * Projeta MRR para os próximos meses
 */
export function forecastMRR(
  currentMRR: number,
  growthRateMonthly: number = 0.1, // 10% monthly growth
  months: number = 12
): number[] {
  const forecast = [currentMRR];
  
  for (let i = 1; i < months; i++) {
    const nextMRR = forecast[i - 1] * (1 + growthRateMonthly);
    forecast.push(nextMRR);
  }
  
  return forecast;
}

/**
 * Projeta churn impact
 */
export function forecastChurnImpact(
  activeCustomers: number,
  churnRateMonthly: number = 0.02, // 2% monthly
  newCustomersPerMonth: number = 20,
  months: number = 12
): number[] {
  const forecast = [activeCustomers];
  
  for (let i = 1; i < months; i++) {
    const current = forecast[i - 1];
    const churned = current * churnRateMonthly;
    const next = Math.max(0, current - churned + newCustomersPerMonth);
    forecast.push(next);
  }
  
  return forecast;
}

/**
 * Calcula impacto total de uma métrica
 */
export function calculateImpact(
  baseValue: number,
  percentChange: number
): { newValue: number; difference: number; percentageChange: number } {
  const newValue = baseValue * (1 + percentChange / 100);
  const difference = newValue - baseValue;
  
  return {
    newValue,
    difference,
    percentageChange: percentChange
  };
}
