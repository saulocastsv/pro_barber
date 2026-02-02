
export enum UserRole {
  OWNER = 'OWNER',
  BARBER = 'BARBER',
  CUSTOMER = 'CUSTOMER'
}

export interface UserPaymentMethod {
  id: string;
  type: 'CARD';
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email?: string;
  password?: string;
  phone?: string;
  points?: number;
  membershipId?: string; // ID do plano ativo
  membershipStartDate?: string;
  membershipHistory?: {
    planId: string;
    date: string;
    type: 'JOIN' | 'MIGRATE' | 'CANCEL';
  }[];
  paymentMethods?: UserPaymentMethod[];
  lastVisitDate?: string;
  healthScore?: number; // 0-100
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  servicesPerMonth: number; // 0 para ilimitado
  includedServiceIds: string[]; // Lista de IDs de serviços permitidos no plano
  includesBeard: boolean;
  benefits: string[];
  activeMembers: number;
  utilizationRate?: number; // % de uso dos serviços contratados
  revenueGenerated?: number;
}

export interface StrategicStats {
  mrr: number; // Monthly Recurring Revenue
  churnRate: number;
  avgUtilization: number; // % de ocupação das cadeiras
  clv: number; // Customer Lifetime Value (Média)
  revenueForecast: number;
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  cost: number; // Custo de insumos/mão de obra por execução
  margin: number; // Margem de lucro esperada em %
  description: string;
}

export interface Appointment {
  id: string;
  barberId: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  startTime: Date;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  isMembershipUsage?: boolean;
  paymentMethod?: 'APP' | 'PRESENTIAL';
  paymentStatus?: 'PAID' | 'PENDING';
  isRescheduled?: boolean;
  isLate?: boolean;
}

export interface QueueItem {
  id: string;
  customerName: string;
  serviceId: string;
  joinedAt: Date;
  estimatedWaitMinutes: number;
  status: 'WAITING' | 'IN_CHAIR' | 'COMPLETED';
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'SERVICE' | 'PRODUCT' | 'MEMBERSHIP_FEE';
  description: string;
  barberId?: string;
}

export interface BarbershopStats {
  monthlyRevenue: number;
  totalAppointments: number;
  newCustomers: number;
  avgTicket: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  minLevel: number;
  category: string;
}

export interface Campaign {
  id: string;
  title: string;
  type: 'WHATSAPP' | 'EMAIL';
  status: 'SENT' | 'DRAFT' | 'SCHEDULED';
  sentCount: number;
  openRate?: number;
  date: string;
  content?: string;
}

export interface LoyaltyAutomation {
  id: string;
  title: string;
  triggerType: 'APPOINTMENT_COUNT' | 'BIRTHDAY' | 'INACTIVITY';
  triggerValue: number;
  message: string;
  active: boolean;
  channel: 'WHATSAPP' | 'EMAIL';
}

export interface ShopSettings {
  shopName: string;
  address: string;
  phone: string;
  openingHours: { start: string; end: string };
  workingDays: string[];
  defaultCommissionRate?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'INFO' | 'ALERT' | 'SUCCESS';
}

export interface CartItem extends StoreProduct {
  cartId: string;
  selectedVariation?: string;
  quantity: number;
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  variations?: string[];
  inStock: boolean;
}

export interface TechnicalNote {
  id: string;
  customerId: string;
  barberId: string;
  note: string;
  tags: string[];
  date: string;
}

export interface BarberAvailabilityException {
  id: string;
  barberId: string;
  startTime: string; // ISO ou HH:mm
  date: string; // YYYY-MM-DD
}
