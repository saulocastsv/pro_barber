
export enum UserRole {
  OWNER = 'OWNER',
  BARBER = 'BARBER',
  CUSTOMER = 'CUSTOMER'
}

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'PRESENTIAL';

export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'READY_FOR_PICKUP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface UserPaymentMethod {
  id: string;
  type: 'CARD';
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface Barbershop {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  ownerId: string;
  logo?: string;
  banner?: string;
  description?: string;
  openingHours: { start: string; end: string };
  workingDays: string[];
  defaultCommissionRate: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email?: string;
  password?: string;
  phone?: string;
  barbershopId?: string; // ID da barbearia a qual o usuário pertence
  points?: number;
  membershipId?: string;
  membershipStartDate?: string;
  membershipHistory?: {
    planId: string;
    date: string;
    type: 'JOIN' | 'MIGRATE' | 'CANCEL';
  }[];
  paymentMethods?: UserPaymentMethod[];
  lastVisitDate?: string;
  healthScore?: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: PaymentMethod;
  deliveryMethod: 'PICKUP' | 'DELIVERY';
  trackingCode?: string;
  trackingHistory?: { status: string; date: string; location?: string }[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  servicesPerMonth: number;
  includedServiceIds: string[];
  includesBeard: boolean;
  benefits: string[];
  activeMembers: number;
  utilizationRate?: number;
  revenueGenerated?: number;
}

export interface StrategicStats {
  mrr: number;
  churnRate: number;
  avgUtilization: number;
  clv: number;
  revenueForecast: number;
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  cost: number;
  margin: number;
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
  paymentMethod?: PaymentMethod;
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
  paymentMethod: PaymentMethod;
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
  startTime: string;
  date: string;
}
