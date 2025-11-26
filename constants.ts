import { User, UserRole, Service, Appointment, QueueItem, Transaction, BarbershopStats, InventoryItem, Campaign, TechnicalNote } from './types';

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Carlos Dono', 
    role: UserRole.OWNER, 
    avatar: 'https://picsum.photos/seed/u1/100/100',
    email: 'admin@barber.com',
    password: '123',
    phone: '(11) 99999-9999'
  },
  { 
    id: 'u2', 
    name: 'Marcos Barbeiro', 
    role: UserRole.BARBER, 
    avatar: 'https://picsum.photos/seed/u2/100/100',
    email: 'marcos@barber.com',
    password: '123',
    phone: '(11) 88888-8888'
  },
  { 
    id: 'u3', 
    name: 'João Barbeiro', 
    role: UserRole.BARBER, 
    avatar: 'https://picsum.photos/seed/u3/100/100',
    email: 'joao@barber.com',
    password: '123',
    phone: '(11) 77777-7777'
  },
  { 
    id: 'u4', 
    name: 'Cliente Teste', 
    role: UserRole.CUSTOMER, 
    avatar: 'https://picsum.photos/seed/u4/100/100',
    email: 'cliente@gmail.com',
    password: '123',
    phone: '(11) 66666-6666'
  },
  { 
    id: 'c1', 
    name: 'Roberto Silva', 
    role: UserRole.CUSTOMER, 
    avatar: 'https://picsum.photos/seed/c1/100/100',
    email: 'roberto@gmail.com',
    phone: '(11) 91111-1111'
  },
  { 
    id: 'c2', 
    name: 'Lucas Moura', 
    role: UserRole.CUSTOMER, 
    avatar: 'https://picsum.photos/seed/c2/100/100',
    email: 'lucas@gmail.com',
    phone: '(11) 92222-2222'
  }
];

export const SERVICES: Service[] = [
  { id: 's1', name: 'Corte de Cabelo', durationMinutes: 30, price: 50, description: 'Corte moderno com tesoura ou máquina.' },
  { id: 's2', name: 'Barba Terapia', durationMinutes: 30, price: 40, description: 'Modelagem de barba com toalha quente.' },
  { id: 's3', name: 'Combo (Corte + Barba)', durationMinutes: 50, price: 80, description: 'O pacote completo.' },
  { id: 's4', name: 'Pezinho / Acabamento', durationMinutes: 15, price: 20, description: 'Apenas os contornos.' },
];

const today = new Date();
const setTime = (d: Date, h: number, m: number) => {
  const newDate = new Date(d);
  newDate.setHours(h, m, 0, 0);
  return newDate;
};

// Dates for mock
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const lastMonth = new Date(today);
lastMonth.setMonth(lastMonth.getMonth() - 1);

export const MOCK_APPOINTMENTS: Appointment[] = [
  // Existing
  { id: 'a1', barberId: 'u2', customerId: 'c1', customerName: 'Roberto Silva', serviceId: 's1', startTime: setTime(today, 10, 0), status: 'COMPLETED' },
  { id: 'a2', barberId: 'u2', customerId: 'c2', customerName: 'Lucas Moura', serviceId: 's3', startTime: setTime(today, 11, 0), status: 'CONFIRMED' },
  { id: 'a3', barberId: 'u3', customerId: 'c3', customerName: 'André Santos', serviceId: 's2', startTime: setTime(today, 10, 30), status: 'CONFIRMED' },
  { id: 'a4', barberId: 'u3', customerId: 'c4', customerName: 'Felipe Neto', serviceId: 's1', startTime: setTime(today, 14, 0), status: 'CONFIRMED' },
  
  // Customer u4 mocks
  { id: 'a5', barberId: 'u2', customerId: 'u4', customerName: 'Cliente Teste', serviceId: 's3', startTime: setTime(tomorrow, 15, 30), status: 'CONFIRMED' },
  { id: 'a6', barberId: 'u3', customerId: 'u4', customerName: 'Cliente Teste', serviceId: 's1', startTime: setTime(yesterday, 18, 0), status: 'COMPLETED' },
  { id: 'a7', barberId: 'u2', customerId: 'u4', customerName: 'Cliente Teste', serviceId: 's2', startTime: setTime(lastMonth, 10, 0), status: 'COMPLETED' },
];

export const MOCK_QUEUE: QueueItem[] = [
  { id: 'q1', customerName: 'Pedro Henrique', serviceId: 's1', joinedAt: new Date(Date.now() - 1000 * 60 * 20), estimatedWaitMinutes: 10, status: 'WAITING' },
  { id: 'q2', customerName: 'Gabriel Costa', serviceId: 's2', joinedAt: new Date(Date.now() - 1000 * 60 * 5), estimatedWaitMinutes: 25, status: 'WAITING' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2023-10-25', amount: 80, type: 'SERVICE', description: 'Combo Corte + Barba', barberId: 'u2' },
  { id: 't2', date: '2023-10-25', amount: 50, type: 'SERVICE', description: 'Corte Simples', barberId: 'u3' },
  { id: 't3', date: '2023-10-25', amount: 45, type: 'PRODUCT', description: 'Pomada Matte' },
  { id: 't4', date: '2023-10-24', amount: 120, type: 'SERVICE', description: 'Corte + Pigmentação', barberId: 'u2' },
  { id: 't5', date: '2023-10-24', amount: 40, type: 'SERVICE', description: 'Barba', barberId: 'u3' },
];

export const MOCK_STATS: BarbershopStats = {
  monthlyRevenue: 15450,
  totalAppointments: 234,
  newCustomers: 45,
  avgTicket: 66,
};

// New Mocks
export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'p1', name: 'Pomada Matte Efeito Seco', quantity: 15, price: 45, minLevel: 10, category: 'Finalização' },
  { id: 'p2', name: 'Shampoo Mentolado 5L', quantity: 5, price: 35, minLevel: 8, category: 'Lavatório' },
  { id: 'p3', name: 'Óleo de Barba Premium', quantity: 12, price: 40, minLevel: 5, category: 'Barba' },
  { id: 'p4', name: 'Cerveja Artesanal IPA', quantity: 48, price: 15, minLevel: 24, category: 'Bar' },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'c1', title: 'Promoção de Natal', type: 'WHATSAPP', status: 'SENT', sentCount: 150, openRate: 85, date: '2023-12-20' },
  { id: 'c2', title: 'Volta às Aulas', type: 'EMAIL', status: 'DRAFT', sentCount: 0, date: '2024-01-15' },
];

export const MOCK_NOTES: TechnicalNote[] = [
  { id: 'n1', customerId: 'c1', barberId: 'u2', date: '2023-10-15', note: 'Cliente prefere disfarçado na 0.5 (Mid Fade). Cuidado com sinal na sobrancelha direita.', tags: ['Mid Fade', 'Sobrancelha'] },
  { id: 'n2', customerId: 'c2', barberId: 'u3', date: '2023-10-10', note: 'Barba desenhada com navalha, pele sensível. Usar toalha morna, não quente.', tags: ['Pele Sensível', 'Barba'] },
];