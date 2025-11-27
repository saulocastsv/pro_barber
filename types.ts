
export enum UserRole {
  OWNER = 'OWNER',
  BARBER = 'BARBER',
  CUSTOMER = 'CUSTOMER'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email?: string;
  password?: string;
  phone?: string;
  points?: number; // Added points
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
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
  type: 'SERVICE' | 'PRODUCT';
  description: string;
  barberId?: string;
}

export interface BarbershopStats {
  monthlyRevenue: number;
  totalAppointments: number;
  newCustomers: number;
  avgTicket: number;
}

// Novos Tipos
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

export interface LoyaltyConfig {
  pointsPerCurrency: number;
  minPointsToRedeem: number;
}

export interface TechnicalNote {
  id: string;
  customerId: string;
  barberId: string;
  date: string;
  note: string;
  tags: string[];
}

// Loja Virtual
export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  variations?: string[]; // e.g. "100ml", "200ml", "Matte", "Brilho"
  inStock: boolean;
}

export interface CartItem extends StoreProduct {
  cartId: string;
  selectedVariation?: string;
  quantity: number;
}

// Configurações e Notificações
export interface ShopSettings {
  shopName: string;
  address: string;
  phone: string;
  openingHours: { start: string; end: string };
  workingDays: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'INFO' | 'ALERT' | 'SUCCESS';
}
