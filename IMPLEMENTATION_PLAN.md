# 🚀 PLANO DE IMPLEMENTAÇÃO - CORREÇÕES CRÍTICAS + NOVAS FUNCIONALIDADES

**Projetado para:** 90 dias | **Equipe:** 2-3 desenvolvedores full-time

---

## 📋 ÍNDICE

1. [Correções Críticas (30 dias)](#correções-críticas)
2. [Melhorias Importantes (30-60 dias)](#melhorias-importantes)
3. [Diferenciais Competitivos (60-90 dias)](#diferenciais-competitivos)
4. [Arquitetura Necessária](#arquitetura)
5. [Código de Exemplo](#código-exemplo)
6. [Timeline Detalhada](#timeline)

---

## <a name="correções-críticas"></a>🔴 CORREÇÕES CRÍTICAS (30 DIAS)

### PRIORIDADE 1: Integração de Pagamento Recorrente

#### Por quê?
- 🚫 Sem isso, assinatura é impossível
- 💰 Bloqueia R$ 2-5K/mês de receita
- 📊 Faz concorrentes terem vantagem

#### O que fazer?

**1.1 Escolher Gateway**
```
Opção 1: MercadoPago (RECOMENDADO para Brasil)
├─ Fees: 3.99% + R$ 0.40/transação
├─ Suporte: Português
├─ Recorrência: Nativa
└─ SKD: Excelente

Opção 2: Stripe
├─ Fees: 4.99% + R$ 0.30/transação
├─ Suporte: Inglês
├─ Recorrência: Excelente
└─ SKD: Melhor documentação

DECISÃO: MercadoPago
```

**1.2 Criar Serviço de Pagamento**

```typescript
// services/paymentService.ts
import { MercadoPagoConfig, Payment, PreApprovalPlan } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export const paymentService = {
  // 1. Criar plano recorrente
  async createSubscriptionPlan(planData: MembershipPlan) {
    const preApprovalPlan = new PreApprovalPlan(client);
    
    return preApprovalPlan.create({
      reason: `Plano ${planData.name} - Barvo`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: planData.price,
        currency_id: 'BRL',
      },
      payer_email_template: 'optimized',
    });
  },

  // 2. Cobrar primeira mensalidade + recorrência
  async chargeSubscription(planId: string, cardToken: string, userId: string) {
    const payment = new Payment(client);
    
    try {
      const result = await payment.create({
        body: {
          transaction_amount: 0, // Recorrência, sem cobrança inicial
          description: `Assinatura Barvo - ${userId}`,
          preapproval_plan_id: planId,
          payer: {
            email: `customer+${userId}@barvo.com`,
            identification: {
              type: 'CPF',
              number: '12345678900', // TODO: Get from user
            },
          },
          back_urls: {
            success: `${process.env.APP_URL}/subscription/success`,
            pending: `${process.env.APP_URL}/subscription/pending`,
            failure: `${process.env.APP_URL}/subscription/failure`,
          },
          notification_url: `${process.env.APP_URL}/api/webhooks/mercadopago`,
        },
      });

      return result;
    } catch (error) {
      console.error('Payment error:', error);
      throw new Error('Falha ao processar pagamento');
    }
  },

  // 3. Webhook handler
  async handleWebhook(event: any) {
    if (event.type === 'subscription_preapproval') {
      const { resource_id } = event.data;
      
      // Atualizar user no banco
      const subscription = await getSubscription(resource_id);
      await updateUserSubscription(subscription.user_id, {
        membershipId: subscription.plan_id,
        membershipStartDate: new Date(),
        subscriptionStatus: 'ACTIVE',
      });
      
      // Enviar email de confirmação
      await emailService.sendSubscriptionConfirmation(subscription.user_id);
    }
  },

  // 4. Cancelar assinatura
  async cancelSubscription(planId: string) {
    const preApprovalPlan = new PreApprovalPlan(client);
    return preApprovalPlan.update(planId, { status: 'CANCELLED' });
  },
};
```

**1.3 Adicionar Checkout em StrategicGrowth**

```typescript
// components/StrategicGrowth.tsx (modificado)

interface CheckoutState {
  step: 'SELECT_PLAN' | 'PAYMENT_METHOD' | 'CARD_DATA' | 'CONFIRMATION';
  selectedPlan: MembershipPlan | null;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';
  cardData: { number: string; expiry: string; cvc: string; name: string };
  isProcessing: boolean;
}

export const StrategicGrowth: React.FC<StrategicGrowthProps> = ({ services, plans, setPlans, currentUser, onPurchaseSubscription }) => {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    step: 'SELECT_PLAN',
    selectedPlan: null,
    paymentMethod: 'CREDIT_CARD',
    cardData: { number: '', expiry: '', cvc: '', name: '' },
    isProcessing: false,
  });

  const handleSelectPlan = (plan: MembershipPlan) => {
    setCheckoutState(prev => ({
      ...prev,
      selectedPlan: plan,
      step: 'PAYMENT_METHOD',
    }));
  };

  const handleConfirmSubscription = async () => {
    if (!checkoutState.selectedPlan) return;

    setCheckoutState(prev => ({ ...prev, isProcessing: true }));

    try {
      // 1. Tokenizar cartão (nunca enviar dados brutos)
      const cardToken = await tokenizeCard(checkoutState.cardData);

      // 2. Criar assinatura
      const result = await onPurchaseSubscription(
        checkoutState.selectedPlan.id,
        cardToken,
        currentUser.id
      );

      if (result.success) {
        // 3. Mostrar confirmação
        setCheckoutState(prev => ({
          ...prev,
          step: 'CONFIRMATION',
          isProcessing: false,
        }));

        // 4. Redirecionar após 3s
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      alert(`Erro: ${error.message}`);
      setCheckoutState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  return (
    <div className="space-y-8">
      {checkoutState.step === 'SELECT_PLAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
              className="p-6 border-2 border-slate-100 rounded-2xl hover:border-brand-dark transition-all"
            >
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-2xl font-black text-brand-dark">R$ {plan.price}/mês</p>
              <button className="w-full mt-4 bg-brand-dark text-white py-3 rounded-lg font-bold">
                Escolher Plano
              </button>
            </button>
          ))}
        </div>
      )}

      {checkoutState.step === 'PAYMENT_METHOD' && (
        <PaymentMethodSelector
          selectedMethod={checkoutState.paymentMethod}
          onSelect={(method) => {
            setCheckoutState(prev => ({
              ...prev,
              paymentMethod: method,
              step: 'CARD_DATA',
            }));
          }}
        />
      )}

      {checkoutState.step === 'CARD_DATA' && (
        <CardFormComponent
          cardData={checkoutState.cardData}
          onChange={(cardData) => {
            setCheckoutState(prev => ({ ...prev, cardData }));
          }}
          onSubmit={handleConfirmSubscription}
          isProcessing={checkoutState.isProcessing}
        />
      )}

      {checkoutState.step === 'CONFIRMATION' && (
        <SubscriptionConfirmationComponent plan={checkoutState.selectedPlan!} />
      )}
    </div>
  );
};
```

**1.4 Webhook Endpoint**

```typescript
// app/api/webhooks/mercadopago/route.ts
import { paymentService } from '@/services/paymentService';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const event = await req.json();

  // 1. Validar assinatura do webhook (importante!)
  const isValid = validateWebhookSignature(event, process.env.MERCADOPAGO_WEBHOOK_SECRET!);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 2. Processar evento
  try {
    await paymentService.handleWebhook(event);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
```

---

### PRIORIDADE 2: Corrigir Cálculos de Margem

#### Problema Atual
```typescript
const margin = simData.price > 0 ? ((simData.price - monthlyServicesCost) / simData.price * 100) : 0;
// ❌ Ignora overhead
// ❌ Cálculo errado de LTV
// ❌ Break-even inútil
```

#### Solução

```typescript
// services/calculationService.ts

export const calculationService = {
  // Calcular margem corretamente
  calculateMargin(price: number, cost: number, overhead: number = 0): number {
    const totalCost = cost + overhead;
    if (price <= 0) return 0;
    return ((price - totalCost) / price) * 100;
  },

  // Calcular LTV corretamente
  calculateLTV(
    monthlyPrice: number,
    monthlyCost: number,
    customerAcquisitionCost: number = 50,
    churnRate: number = 0.05
  ): number {
    // LTV = (Margem mensal) × (Vida média do cliente) - CAC
    const avgMonths = 1 / churnRate; // Se churn é 5%, cliente dura 20 meses
    const monthlyMargin = monthlyPrice - monthlyCost;
    
    return (monthlyMargin * avgMonths) - customerAcquisitionCost;
  },

  // Payback period
  calculatePaybackPeriod(
    monthlyPrice: number,
    monthlyCost: number,
    cac: number = 50
  ): number {
    const monthlyMargin = monthlyPrice - monthlyCost;
    if (monthlyMargin <= 0) return Infinity;
    return Math.ceil(cac / monthlyMargin);
  },

  // Calcular limite de serviços para viabilidade
  calculateViableServicesPerMonth(
    planPrice: number,
    servicePrice: number,
    serviceCost: number,
    targetMargin: number = 0.4, // 40%
    overhead: number = 10 // R$ 10 por cliente
  ): number {
    // planPrice = (serviceCost + overhead) × servicesPerMonth + profit
    // servicesPerMonth = (planPrice - (planPrice × targetMargin)) / (serviceCost + (overhead / servicesPerMonth))
    // Simplificado: servicesPerMonth = planPrice × targetMargin / serviceCost
    
    const maxServicesToProfitable = Math.floor((planPrice * targetMargin) / serviceCost);
    return Math.max(1, maxServicesToProfitable);
  }
};
```

#### Integrar em StrategicGrowth

```typescript
// components/StrategicGrowth.tsx
import { calculationService } from '@/services/calculationService';

const calculatePlanMetrics = () => {
  const selectedServices = services.filter(s => simData.includedServiceIds.includes(s.id));
  
  if (selectedServices.length === 0) {
    return { margin: 0, ltv: 0, paybackPeriod: Infinity };
  }

  const totalServiceCost = selectedServices.reduce((sum, s) => sum + s.cost, 0);
  const overhead = 15; // R$ 15 de overhead por cliente/mês
  const cac = 50; // R$ 50 de customer acquisition cost
  const churnRate = 0.05; // 5% churn assumido

  const margin = calculationService.calculateMargin(
    simData.price,
    totalServiceCost,
    overhead
  );

  const ltv = calculationService.calculateLTV(
    simData.price,
    totalServiceCost + overhead,
    cac,
    churnRate
  );

  const paybackPeriod = calculationService.calculatePaybackPeriod(
    simData.price,
    totalServiceCost + overhead,
    cac
  );

  return {
    margin,
    ltv,
    paybackPeriod,
    totalServiceCost,
    overhead,
  };
};
```

---

### PRIORIDADE 3: Validar Assinatura no BookingFlow

#### Antes
```typescript
// ❌ Não valida assinatura
// ❌ Não aplica desconto
// ❌ Não decrementa limite
```

#### Depois
```typescript
// components/BookingFlow.tsx (modificado)

const validateSubscriptionAndApplyDiscount = () => {
  if (!currentUser?.membershipId) return null;

  const userPlan = plans.find(p => p.id === currentUser.membershipId);
  if (!userPlan) return null;

  // 1. Verificar se assinatura está ativa
  const membershipStartDate = new Date(currentUser.membershipStartDate!);
  const now = new Date();
  const monthsDiff = (now.getFullYear() - membershipStartDate.getFullYear()) * 12 + 
                     (now.getMonth() - membershipStartDate.getMonth());
  
  if (monthsDiff > 0) {
    return null; // Assinatura expirou
  }

  // 2. Verificar se tem serviços restantes
  const usage = getSubscriptionUsageThisMonth(currentUser.id, currentUser.membershipId);
  if (usage >= userPlan.servicesPerMonth) {
    return null; // Limite atingido
  }

  // 3. Aplicar desconto
  const selectedServices = services.filter(s => selection.serviceIds.includes(s.id));
  const originalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const discount = originalPrice * 0.5; // Desconto de 50% para subscribers
  
  return {
    plan: userPlan,
    originalPrice,
    discount,
    finalPrice: originalPrice - discount,
    servicesRemaining: userPlan.servicesPerMonth - usage,
  };
};

// Usar em handleNextStep
const handleNextStep = () => {
  if (step === 5) {
    const subscriptionBenefit = validateSubscriptionAndApplyDiscount();
    
    if (subscriptionBenefit) {
      // Mostrar banner de desconto
      showToast(
        `Desconto de assinatura aplicado! -R$ ${subscriptionBenefit.discount.toFixed(2)}`,
        'success'
      );
      
      // Atualizar seleção com desconto
      setSelection(prev => ({
        ...prev,
        descountApplied: true,
        finalPrice: subscriptionBenefit.finalPrice,
      }));
    }
  }
  
  setStep(s => s + 1);
};

// Confirmar booking e decrementar limite
const confirmBooking = async () => {
  // ... validações existentes ...

  if (selection.descountApplied && currentUser?.membershipId) {
    // Decrementar uso de serviço do plano
    await updateSubscriptionUsage(currentUser.id, currentUser.membershipId, {
      usedThisMonth: (existingUsage || 0) + selection.serviceIds.length,
    });
  }

  // ... resto do código ...
};
```

---

### PRIORIDADE 4: Testes

#### Testes Unitários
```typescript
// __tests__/calculations.test.ts

import { calculationService } from '@/services/calculationService';

describe('Calculation Service', () => {
  describe('calculateMargin', () => {
    it('should calculate correct margin', () => {
      const margin = calculationService.calculateMargin(100, 30, 15);
      expect(margin).toBeCloseTo(55, 0); // (100 - 30 - 15) / 100 = 55%
    });

    it('should return 0 for invalid price', () => {
      expect(calculationService.calculateMargin(0, 30, 15)).toBe(0);
      expect(calculationService.calculateMargin(-100, 30, 15)).toBe(0);
    });
  });

  describe('calculateLTV', () => {
    it('should include CAC in calculation', () => {
      // monthlyMargin = 100 - 30 = 70
      // avgMonths = 1 / 0.05 = 20
      // ltv = (70 * 20) - 50 = 1350
      const ltv = calculationService.calculateLTV(100, 30, 50, 0.05);
      expect(ltv).toBe(1350);
    });

    it('should return negative LTV if unprofitable', () => {
      const ltv = calculationService.calculateLTV(50, 60, 50, 0.05);
      expect(ltv).toBeLessThan(0);
    });
  });

  describe('calculatePaybackPeriod', () => {
    it('should calculate correct payback', () => {
      // cac = 50, monthlyMargin = 70, payback = 50 / 70 ≈ 1 mês
      const payback = calculationService.calculatePaybackPeriod(100, 30, 50);
      expect(payback).toBe(1);
    });

    it('should return Infinity for negative margin', () => {
      expect(calculationService.calculatePaybackPeriod(50, 60, 50)).toBe(Infinity);
    });
  });
});
```

---

## <a name="melhorias-importantes"></a>🟡 MELHORIAS IMPORTANTES (30-60 DIAS)

### PRIORIDADE 5: Notificações Automáticas

```typescript
// services/notificationService.ts

import twilio from 'twilio';

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const notificationService = {
  async sendSMS(phone: string, message: string) {
    return twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  },

  async sendWhatsApp(phone: string, message: string, templateName?: string) {
    // Se usar WhatsApp Business API (recomendado)
    return twilio.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phone}`,
      // Opcional: usar template
      ...(templateName && { contentSid: TEMPLATES[templateName] }),
    });
  },

  // Templates automáticos
  templates: {
    BOOKING_CONFIRMATION: (customerName: string, serviceName: string, date: string, time: string) => 
      `Olá ${customerName}! Sua reserva para ${serviceName} em ${date} às ${time} foi confirmada. 📅✂️`,
    
    BOOKING_REMINDER: (customerName: string, date: string, time: string) =>
      `${customerName}, lembramos que você tem agendamento amanhã às ${time}. Confira seus dados! 🔔`,
    
    SUBSCRIPTION_CONFIRMATION: (planName: string, price: number) =>
      `Bem-vindo ao plano ${planName}! Você agora tem acesso a benefícios exclusivos. Próxima cobrança: R$ ${price}. 💳`,
    
    SUBSCRIPTION_REMINDER: (daysLeft: number) =>
      `Sua assinatura vence em ${daysLeft} dias. Renove agora para continuar aproveitando benefícios! 🔔`,
  }
};
```

### PRIORIDADE 6: Comissões Automáticas

```typescript
// services/commissionService.ts

export const commissionService = {
  // Calcular comissão por agendamento
  calculateCommission(
    servicePrice: number,
    commissionRate: number = 0.5 // 50% padrão
  ): number {
    return servicePrice * commissionRate;
  },

  // Agendar pagamento para barbeiro
  async scheduleBarberPayment(barberId: string, amount: number) {
    const barber = await getUser(barberId);
    if (!barber.pixKey) {
      throw new Error('Barbeiro não tem chave Pix cadastrada');
    }

    // 1. Criar transferência
    const transfer = {
      id: `transfer_${Date.now()}`,
      barberId,
      amount,
      pixKey: barber.pixKey,
      status: 'PENDING_PROCESSING',
      createdAt: new Date(),
      processedAt: null,
    };

    // 2. Salvar em DB
    await saveBarbierTransfer(transfer);

    // 3. Agendar para processo diário (via cron)
    // - Agregar transferências
    // - Processar em lote
    // - Enviar notificação

    return transfer;
  },

  // Processar pagamentos pendentes (executar diariamente)
  async processPendingPayments() {
    const pendingTransfers = await getPendingBarberTransfers();
    
    for (const transfer of pendingTransfers) {
      try {
        // 1. Processar via PIX
        const result = await pixService.transfer({
          amount: transfer.amount,
          recipientKey: transfer.pixKey,
          description: `Comissão - Barvo Barbershop`,
        });

        // 2. Atualizar status
        await updateBarbierTransfer(transfer.id, {
          status: 'PROCESSED',
          processedAt: new Date(),
          transactionId: result.id,
        });

        // 3. Notificar barbeiro
        await notificationService.sendWhatsApp(
          (await getUser(transfer.barberId)).phone!,
          notificationService.templates.PAYMENT_PROCESSED(transfer.amount)
        );
      } catch (error) {
        await updateBarbierTransfer(transfer.id, {
          status: 'FAILED',
          error: error.message,
        });
      }
    }
  },
};
```

---

## <a name="diferenciais-competitivos"></a>🟢 DIFERENCIAIS COMPETITIVOS (60-90 DIAS)

### PRIORIDADE 7: APP Mobile (React Native)

```bash
# Criar projeto Expo
npx create-expo-app barvo-mobile
cd barvo-mobile
npx expo install react-native-navigation
```

**Estrutura Inicial:**
```
barvo-mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (customer)/
│   │   ├── dashboard.tsx
│   │   ├── booking.tsx
│   │   └── appointments.tsx
│   └── app.json
├── services/
│   ├── api.ts
│   └── authService.ts
└── components/
    └── shared/
```

### PRIORIDADE 8: Marketplace de Profissionais

```typescript
// types/marketplace.ts

export interface IndependentBarber {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  phone: string;
  pixKey: string;
  
  // Avaliação
  rating: number;
  reviewsCount: number;
  
  // Serviços
  services: Service[];
  
  // Disponibilidade
  workingHours: { start: string; end: string };
  workingDays: string[];
  
  // Comissão
  commissionRate: number; // 15-25%
  
  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: Date;
  createdAt: Date;
}
```

---

## <a name="arquitetura"></a>📐 ARQUITETURA NECESSÁRIA

### Nova Estrutura de Banco de Dados

```typescript
// types/database.ts

// Tabelas novaspub interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  startDate: Date;
  endDate?: Date;
  nextBillingDate: Date;
  paymentMethodId: string;
  usedServicesThisMonth: number;
  metadata: {
    paymentGateway: 'MERCADOPAGO' | 'STRIPE';
    subscriptionId: string; // ID no gateway
  };
}

export interface SubscriptionUsage {
  subscriptionId: string;
  month: string; // YYYY-MM
  usedServices: number;
  bookings: string[]; // IDs dos agendamentos
}

export interface BarberTransfer {
  id: string;
  barberId: string;
  amount: number;
  status: 'PENDING_PROCESSING' | 'PROCESSED' | 'FAILED';
  createdAt: Date;
  processedAt?: Date;
  pixKey: string;
  transactionId?: string;
  error?: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'CREDIT_CARD' | 'DEBIT_CARD';
  brand: string;
  last4: string;
  expiry: string;
  token: string; // Tokenizado no gateway
  isDefault: boolean;
}
```

### Ambiente Variables Necessárias

```bash
# .env.local

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_token_here
MERCADOPAGO_PUBLIC_KEY=your_public_key
MERCADOPAGO_WEBHOOK_SECRET=your_secret

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+55...
TWILIO_WHATSAPP_NUMBER=+55...

# PIX (para transferências)
PIX_API_KEY=your_key

# Stripe (opcional)
STRIPE_PUBLIC_KEY=your_key
STRIPE_SECRET_KEY=your_secret

# URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:3000
```

---

## <a name="código-exemplo"></a>📝 CÓDIGO DE EXEMPLO - INTEGRAÇÃO COMPLETA

### Exemplo Completo: Fluxo de Assinatura

```typescript
// app/api/subscription/create/route.ts

import { paymentService } from '@/services/paymentService';
import { notificationService } from '@/services/notificationService';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, cardToken, userId } = body;

    // 1. Validar plano
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    // 2. Validar user
    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // 3. Criar assinatura no MercadoPago
    const subscription = await paymentService.chargeSubscription(
      planId,
      cardToken,
      userId
    );

    if (subscription.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Pagamento recusado' },
        { status: 400 }
      );
    }

    // 4. Atualizar usuário
    await updateUser(userId, {
      membershipId: planId,
      membershipStartDate: new Date(),
      membershipStatus: 'ACTIVE',
    });

    // 5. Criar registro de uso
    await createSubscriptionUsage({
      subscriptionId: subscription.id,
      month: new Date().toISOString().slice(0, 7), // YYYY-MM
      usedServices: 0,
      bookings: [],
    });

    // 6. Enviar confirmação
    await notificationService.sendWhatsApp(
      user.phone!,
      notificationService.templates.SUBSCRIPTION_CONFIRMATION(
        plan.name,
        plan.price
      )
    );

    // 7. Enviar email
    await emailService.send({
      to: user.email!,
      subject: `Bem-vindo ao plano ${plan.name} - Barvo`,
      template: 'subscription-welcome',
      data: {
        customerName: user.name,
        planName: plan.name,
        planPrice: plan.price,
        benefits: plan.benefits,
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      message: 'Assinatura criada com sucesso!',
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar assinatura' },
      { status: 500 }
    );
  }
}
```

---

## <a name="timeline"></a>⏰ TIMELINE DETALHADA

### Semana 1-2: Foundation
- [ ] Setup MercadoPago
- [ ] Criar paymentService.ts
- [ ] Implementar webhooks
- [ ] Testes unitários de pagamento

### Semana 3-4: Cálculos & Validação
- [ ] Corrigir cálculos de margem
- [ ] Implementar validação de assinatura em BookingFlow
- [ ] Testes de integração

### Semana 5-6: UI & Fluxo
- [ ] Implementar checkout em StrategicGrowth
- [ ] Adicionar tela de confirmação
- [ ] Testes E2E

### Semana 7-8: Notificações & Comissões
- [ ] Integrar Twilio
- [ ] Implementar commissionService
- [ ] Sistema de pagamento para barbeiros

### Semana 9-10: Mobile & Marketplace
- [ ] Setup React Native
- [ ] Marketplace infrastructure
- [ ] Primo de profissionais

### Semana 11-12: Premium & Polish
- [ ] Premium features
- [ ] API pública
- [ ] Testing & QA final

---

## 📊 ESTIMATIVAS

| Fase | Horas | Dev | QA | Total |
|------|-------|-----|-----|--------|
| Correções (30d) | 240 | 2 | 1 | 360h |
| Melhorias (30d) | 160 | 1.5 | 0.5 | 240h |
| Diferenciais (30d) | 200 | 2 | 1 | 300h |
| **TOTAL** | | | | **900h** |

**Em 3 devs full-time = ~3 meses** ✅

---

## 🎯 ÉXITO ESPERADO

```
ANTES (30 dias)
├─ Assinatura recorrente: ❌
├─ Pagamento: ❌
└─ Desconto automático: ❌

DEPOIS (90 dias)
├─ Assinatura recorrente: ✅
├─ Pagamento automático: ✅
├─ Desconto automático: ✅
├─ Notificações SMS/WhatsApp: ✅
├─ Comissões de barbeiro: ✅
├─ APP Mobile MVP: ✅
├─ Marketplace: ✅ MVP
└─ Premium features: ✅ MVP

RESULTADO FINANCEIRO
├─ MRR atual: R$ 2.500
├─ MRR projetado (3 meses): R$ 8.000 (+220%)
├─ MRR projetado (12 meses): R$ 25.000 (+900%)
└─ Churn reduzido: 12% → 5% (via assinatura)
```

---

**Próxima Reunião:** Alinhamento de timeline e alocação de recursos

