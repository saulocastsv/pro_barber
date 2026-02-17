/**
 * MEMBERSHIP SERVICE
 * Gerencia toda a lógica de assinatura
 */

import { User, MembershipPlan, Appointment } from '@/types';

// Tipo auxiliar para rastrear uso de assinatura
export interface SubscriptionUsage {
  planId: string;
  customerId: string;
  servicesUsedThisMonth: number;
  month: string; // YYYY-MM
  createdAt: string;
  resetDate: string;
}

// Armazenar em localStorage
const SUBSCRIPTION_STORAGE_KEY = 'pro_barber_memberships';
const SUBSCRIPTION_USAGE_KEY = 'pro_barber_usage';

// ============ DADOS DE EXEMPLO (para apresentação) ============

export const DEMO_ACTIVE_MEMBERSHIPS: { [customerId: string]: { planId: string; startDate: string } } = {
  'u4': { planId: 'mp1', startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }, // Cliente teste ativo há 1 mês
};

// ============ GESTÃO DE ASSINATURA ============

/**
 * Verifica se um cliente tem assinatura ativa
 */
export function isSubscribed(customerId: string, user?: User): boolean {
  // Primeiro verifica localStorage
  const stored = getStoredMemberships();
  if (stored[customerId]) {
    return true;
  }
  
  // Depois verifica dados do usuário
  if (user?.membershipId) {
    return true;
  }
  
  // Verifica dados de demo
  return customerId in DEMO_ACTIVE_MEMBERSHIPS;
}

/**
 * Obtém a assinatura ativa do cliente
 */
export function getActiveMembership(customerId: string): { planId: string; startDate: string } | null {
  // Primeiro verifica localStorage
  const stored = getStoredMemberships();
  if (stored[customerId]) {
    return stored[customerId];
  }
  
  // Depois verifica dados de demo
  if (customerId in DEMO_ACTIVE_MEMBERSHIPS) {
    return DEMO_ACTIVE_MEMBERSHIPS[customerId];
  }
  
  return null;
}

/**
 * Subscreve um cliente a um plano
 */
export function subscribeCustomer(
  customerId: string,
  planId: string
): { success: boolean; message: string } {
  const memberships = getStoredMemberships();
  
  // Verifica se já tem assinatura
  if (memberships[customerId]) {
    return { success: false, message: 'Cliente já possui assinatura ativa' };
  }
  
  // Adiciona a assinatura
  memberships[customerId] = {
    planId,
    startDate: new Date().toISOString()
  };
  
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(memberships));
  
  // Inicializa uso
  resetMonthlyUsage(customerId);
  
  return { success: true, message: 'Assinatura ativada com sucesso' };
}

/**
 * Cancela a assinatura de um cliente
 */
export function cancelCustomerSubscription(customerId: string): void {
  const memberships = getStoredMemberships();
  delete memberships[customerId];
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(memberships));
}

/**
 * Obtém todas as assinaturas ativas (para dashboard)
 */
export function getAllActiveMemberships(): { [customerId: string]: { planId: string; startDate: string } } {
  return getStoredMemberships();
}

/**
 * Conta assinantes ativos total
 */
export function countActiveMembers(): number {
  const stored = getStoredMemberships();
  return Object.keys(stored).length + Object.keys(DEMO_ACTIVE_MEMBERSHIPS).length;
}

// ============ USO DE SERVIÇOS ============

/**
 * Incrementa uso de serviço para a assinatura do cliente
 */
export function incrementServiceUsage(
  customerId: string,
  servicesIncluded: number
): { currentUsage: number; remaining: number; isLimitReached: boolean } {
  const usage = getOrCreateUsage(customerId);
  
  // Incrementa uso
  const newUsage = Math.min(usage.servicesUsedThisMonth + 1, servicesIncluded);
  const shouldIncrement = usage.servicesUsedThisMonth < servicesIncluded;
  
  if (shouldIncrement) {
    usage.servicesUsedThisMonth += 1;
    saveUsage(usage);
  }
  
  return {
    currentUsage: usage.servicesUsedThisMonth,
    remaining: Math.max(0, servicesIncluded - usage.servicesUsedThisMonth),
    isLimitReached: usage.servicesUsedThisMonth >= servicesIncluded
  };
}

/**
 * Verifica se pode usar serviço com a assinatura
 */
export function canUseSubscriptionService(
  customerId: string,
  servicesIncluded: number
): boolean {
  const usage = getCurrentUsage(customerId);
  if (!usage) return false;
  
  return usage.servicesUsedThisMonth < servicesIncluded;
}

/**
 * Obtém informações de uso do cliente neste mês
 */
export function getCustomerMonthlyUsage(
  customerId: string,
  servicesIncluded: number = 4 // default para plano básico
): { used: number; remaining: number; total: number; percentage: number } {
  const usage = getCurrentUsage(customerId);
  const used = usage?.servicesUsedThisMonth || 0;
  const remaining = Math.max(0, servicesIncluded - used);
  
  return {
    used,
    remaining,
    total: servicesIncluded,
    percentage: (used / servicesIncluded) * 100
  };
}

// ============ RESET MENSAL ============

/**
 * Reseta o uso de todos os clientes (chamar no 1º dia do mês)
 */
export function resetAllMonthlyUsage(): void {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const memberships = getStoredMemberships();
  Object.keys(memberships).forEach(customerId => {
    resetMonthlyUsage(customerId);
  });
}

/**
 * Reseta o uso de um cliente específico
 */
export function resetMonthlyUsage(customerId: string): void {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  const usage: SubscriptionUsage = {
    planId: getActiveMembership(customerId)?.planId || '',
    customerId,
    servicesUsedThisMonth: 0,
    month: currentMonth,
    createdAt: new Date().toISOString(),
    resetDate: nextMonth.toISOString()
  };
  
  saveUsage(usage);
}

/**
 * Verifica se precisa resetar (passou do mês)
 */
export function shouldResetMonthlyUsage(customerId: string): boolean {
  const usage = getCurrentUsage(customerId);
  if (!usage) return false;
  
  const now = new Date();
  const resetDate = new Date(usage.resetDate);
  
  return now > resetDate;
}

// ============ HELPERS DE ARMAZENAMENTO ============

function getStoredMemberships(): { [customerId: string]: { planId: string; startDate: string } } {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

function getCurrentUsage(customerId: string): SubscriptionUsage | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(SUBSCRIPTION_USAGE_KEY);
  const usages = stored ? JSON.parse(stored) : {};
  
  return usages[customerId] || null;
}

function getOrCreateUsage(customerId: string): SubscriptionUsage {
  let usage = getCurrentUsage(customerId);
  
  if (!usage) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    usage = {
      planId: getActiveMembership(customerId)?.planId || '',
      customerId,
      servicesUsedThisMonth: 0,
      month: currentMonth,
      createdAt: new Date().toISOString(),
      resetDate: nextMonth.toISOString()
    };
  }
  
  // Verifica se precisa resetar
  if (shouldResetMonthlyUsage(customerId)) {
    resetMonthlyUsage(customerId);
    usage = getCurrentUsage(customerId)!;
  }
  
  return usage;
}

function saveUsage(usage: SubscriptionUsage): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(SUBSCRIPTION_USAGE_KEY);
  const usages = stored ? JSON.parse(stored) : {};
  
  usages[usage.customerId] = usage;
  localStorage.setItem(SUBSCRIPTION_USAGE_KEY, JSON.stringify(usages));
}

// ============ RESUMO GLOBAL ============

/**
 * Obtém estatísticas globais de assinatura
 */
export function getGlobalSubscriptionStats() {
  const memberships = getAllActiveMemberships();
  const count = countActiveMembers();
  
  return {
    totalActiveMembers: count,
    activeMemberships: memberships,
    storageSize: new Blob([JSON.stringify(memberships)]).size
  };
}
