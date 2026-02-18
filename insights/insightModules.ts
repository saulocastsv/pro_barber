// Registro dos módulos de insight automáticos
import { TicketMedioInsight } from './ticketMedioInsight';
import { UpsellInsight } from './upsellInsight';
import { MargemInsight } from './margemInsight';

export const allInsights = [
  TicketMedioInsight,
  UpsellInsight,
  MargemInsight
];
