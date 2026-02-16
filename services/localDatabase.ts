import { User, Appointment, Service, InventoryItem, Order, OrderStatus } from '@/types';

const STORAGE_KEY = 'pro_barber_demo_db_v1';

const uuid = () => {
  if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) return (crypto as any).randomUUID();
  return Math.random().toString(36).slice(2, 10);
};

type Profile = Partial<User> & { id: string };

type State = {
  users: Record<string, { id: string; email: string; password: string; createdAt: number }>; // keyed by email
  profiles: Record<string, Profile>;
  barbershops: any[];
  services: Service[];
  appointments: any[];
  inventory: InventoryItem[];
  orders: Order[];
};

const initialState: State = {
  users: {},
  profiles: {},
  barbershops: [],
  services: [],
  appointments: [],
  inventory: [],
  orders: []
};

let state: State = { ...initialState };

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadState() {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = JSON.parse(raw) as State;
    }
  } catch (e) {
    console.warn('Could not load demo DB state', e);
  }
}

function saveState() {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save demo DB state', e);
  }
}

loadState();

export default {
  // Auth-related
  async createUser(email: string, password: string) {
    if (state.users[email]) throw new Error('User already exists');
    const id = uuid();
    state.users[email] = { id, email, password, createdAt: Date.now() };
    await this.createProfile({ id, name: '', role: 'customer', email });
    saveState();
    return { id, email };
  },

  async signIn(email: string, password: string) {
    const u = state.users[email];
    if (!u || u.password !== password) throw new Error('Invalid credentials');
    return { id: u.id, email: u.email };
  },

  // Profiles
  async getProfile(userId: string) {
    return state.profiles[userId] || null;
  },

  async createProfile(profile: Partial<User>) {
    const id = (profile.id as string) || uuid();
    const p: Profile = {
      id,
      name: profile.name || '',
      role: profile.role || ('customer' as any),
      avatar: profile.avatar || '',
      points: profile.points || 0,
      email: profile.email || ''
    };
    state.profiles[id] = p;
    saveState();
    return p;
  },

  async updateProfile(id: string, patch: Partial<Profile>) {
    if (!state.profiles[id]) return null;
    state.profiles[id] = { ...state.profiles[id], ...patch };
    saveState();
    return state.profiles[id];
  },

  // Barbearias & staff
  async createBarbershop(shop: any) {
    const id = shop.id || uuid();
    const b = { ...shop, id, staff: shop.staff || [] };
    state.barbershops.push(b);
    saveState();
    return b;
  },

  async getBarbershopByOwner(ownerId: string) {
    return state.barbershops.find(b => b.owner_id === ownerId) || null;
  },

  async getBarbershopById(shopId: string) {
    return state.barbershops.find(b => b.id === shopId) || null;
  },

  async addStaffToBarbershop(shopId: string, staffId: string, role?: string) {
    const b = state.barbershops.find(x => x.id === shopId);
    if (!b) throw new Error('Barbershop not found');
    b.staff = b.staff || [];
    if (!b.staff.includes(staffId)) b.staff.push(staffId);
    saveState();
    return b;
  },

  // Services
  async getServices(barbershopId: string) {
    return state.services.filter(s => s.barbershop_id === barbershopId) as Service[];
  },

  async saveService(service: Partial<Service> & { barbershop_id: string }) {
    if (!service.id) {
      const s = { ...service, id: uuid() } as Service;
      state.services.push(s);
      saveState();
      return s;
    }
    const idx = state.services.findIndex(s => s.id === service.id);
    if (idx >= 0) {
      state.services[idx] = { ...state.services[idx], ...service } as Service;
      saveState();
      return state.services[idx];
    }
    const s = { ...service, id: service.id } as Service;
    state.services.push(s);
    saveState();
    return s;
  },

  async deleteService(id: string) {
    state.services = state.services.filter(s => s.id !== id);
    saveState();
  },

  // Appointments
  async getAppointments(barbershopId?: string) {
    const items = barbershopsOrAll(state.appointments, barbershopId);
    return items.map(d => ({ ...d, startTime: new Date(d.startTime) })) as Appointment[];
  },

  async createAppointment(appt: any) {
    const a = { ...appt, id: uuid(), status: 'scheduled', createdAt: Date.now() };
    state.appointments.push(a);
    saveState();
    return a;
  },

  async updateAppointmentStatus(id: string, status: string, rating?: number) {
    const idx = state.appointments.findIndex(a => a.id === id);
    if (idx >= 0) {
      state.appointments[idx].status = status;
      if (rating) state.appointments[idx].customerRating = rating;
      saveState();
    }
  },

  // Inventory & products
  async getInventory(barbershopId: string) {
    return state.inventory.filter(i => i.barbershop_id === barbershopId) as InventoryItem[];
  },

  async upsertInventoryItem(item: any) {
    if (!item.id) {
      const it = { ...item, id: uuid() };
      state.inventory.push(it);
      saveState();
      return it;
    }
    const idx = state.inventory.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      state.inventory[idx] = { ...state.inventory[idx], ...item };
      saveState();
      return state.inventory[idx];
    }
    const it = { ...item, id: item.id };
    state.inventory.push(it);
    saveState();
    return it;
  },

  // Orders and sales
  async getOrders(barbershopId: string) {
    return state.orders.filter(o => o.barbershop_id === barbershopId).sort((a, b) => {
      const aTime = typeof a.createdAt === 'number' ? a.createdAt : parseInt(a.createdAt) || 0;
      const bTime = typeof b.createdAt === 'number' ? b.createdAt : parseInt(b.createdAt) || 0;
      return bTime - aTime;
    }) as Order[];
  },

  async createOrder(order: any) {
    // order.items: [{ productId, qty, price }]
    // debit inventory
    const insufficient: any[] = [];
    for (const it of order.items || []) {
      const inv = state.inventory.find(i => i.id === it.productId && i.barbershop_id === order.barbershop_id);
      if (!inv) {
        insufficient.push({ productId: it.productId, reason: 'not found' });
        continue;
      }
      if ((inv.quantity ?? 0) < it.qty) {
        insufficient.push({ productId: it.productId, reason: 'insufficient', avail: inv.quantity });
      }
    }
    if (insufficient.length) throw new Error('Insufficient inventory: ' + JSON.stringify(insufficient));

    // debit
    for (const it of order.items || []) {
      const inv = state.inventory.find(i => i.id === it.productId && i.barbershop_id === order.barbershop_id);
      if (inv) inv.quantity = (inv.quantity || 0) - it.qty;
    }

    const o = { ...order, id: uuid(), createdAt: Date.now(), status: 'created' };
    state.orders.push(o);
    saveState();
    return o;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, trackingCode?: string) {
    const idx = state.orders.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      state.orders[idx].status = status;
      if (trackingCode) state.orders[idx].trackingCode = trackingCode;
      saveState();
    }
  }
};

function barbershopsOrAll<T extends { barbershop_id?: string }>(arr: T[], barbershopId?: string) {
  if (!barbershopId) return arr;
  return arr.filter(a => a.barbershop_id === barbershopId);
}

