
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { User, Appointment, Service, InventoryItem, Order, OrderStatus } from '@/types';
import localDb from './localDatabase';

/**
 * Camada de Abstração de Dados (Data Access Layer)
 * Centraliza todas as chamadas ao Supabase para manter o código limpo e fácil de testar.
 */
const useDemo = process.env.NEXT_PUBLIC_DEMO_DB === 'true' || !isSupabaseConfigured();

if (useDemo) {
  console.info('⚠️ Usando demo DB em memória (NEXT_PUBLIC_DEMO_DB=true ou Supabase não configurado)');
}

const supabaseDb = {
  // --- PERFIS & AUTENTICAÇÃO ---
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Erro ao buscar perfil:", e);
      return null;
    }
  },

  async createProfile(profile: Partial<User>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- BARBEARIAS (SaaS Context) ---
  async getBarbershopByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('barbershops')
      .select('*')
      .eq('owner_id', ownerId)
      .single();
    if (error) return null;
    return data;
  },

  async createBarbershop(shop: any) {
    const { data, error } = await supabase
      .from('barbershops')
      .insert([shop])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getBarbershopById(shopId: string) {
    const { data, error } = await supabase
      .from('barbershops')
      .select('*')
      .eq('id', shopId)
      .single();
    if (error) return null;
    return data;
  },

  // --- SERVIÇOS ---
  async getServices(barbershopId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .order('name');
    if (error) throw error;
    return data as Service[];
  },

  async saveService(service: Partial<Service> & { barbershop_id: string }) {
    const { data, error } = await supabase
      .from('services')
      .upsert([service])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteService(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // --- AGENDA & AGENDAMENTOS ---
  async getAppointments(barbershopId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .order('startTime', { ascending: true });
    if (error) throw error;
    return data.map(d => ({ ...d, startTime: new Date(d.startTime) })) as Appointment[];
  },

  async createAppointment(appt: any) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appt])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAppointmentStatus(id: string, status: string, rating?: number) {
    const updateData: any = { status };
    if (rating) updateData.customerRating = rating;
    
    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id);
    if (error) throw error;
  },

  // --- ESTOQUE & PRODUTOS ---
  async getInventory(barbershopId: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('barbershop_id', barbershopId);
    if (error) throw error;
    return data as InventoryItem[];
  },

  async upsertInventoryItem(item: any) {
    const { data, error } = await supabase
      .from('inventory')
      .upsert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- PEDIDOS (LOJA) ---
  async getOrders(barbershopId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data as Order[];
  },

  async createOrder(order: any) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, trackingCode?: string) {
    const updateData: any = { status };
    if (trackingCode) updateData.trackingCode = trackingCode;
    
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);
    if (error) throw error;
  }
};

export const db = useDemo ? (localDb as any) : (supabaseDb as any);
