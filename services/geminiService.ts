import { User, UserRole } from "@/types";

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

/**
 * Assistente de chat local (offline/demo mode).
 * Quando uma API de IA estiver configurada, basta substituir o corpo desta funcao
 * por uma chamada fetch ao endpoint /api/chat.
 */
export const sendMessageToGemini = async (history: ChatMessage[], user: User | null): Promise<string> => {
  try {
    // Simula um pequeno delay para parecer natural
    await new Promise(resolve => setTimeout(resolve, 800));

    const lastMsg = history[history.length - 1]?.text?.toLowerCase() || '';

    // Respostas contextuais basicas por role
    if (user?.role === UserRole.OWNER) {
      if (lastMsg.includes('faturamento') || lastMsg.includes('receita') || lastMsg.includes('lucro')) {
        return "Analisando seus dados: o faturamento mensal esta em R$ 15.450, com ticket medio de R$ 66. Recomendo focar em upsell de combos para aumentar o ticket medio em pelo menos 15%.";
      }
      if (lastMsg.includes('equipe') || lastMsg.includes('barbeiro')) {
        return "Sua equipe tem 2 barbeiros ativos. Para otimizar a agenda, considere definir horarios de pico e distribuir os agendamentos de forma equilibrada.";
      }
      return "Como consultor de negocios da Barvo, posso ajudar com analise de faturamento, gestao de equipe, estrategias de crescimento e otimizacao de servicos. O que gostaria de explorar?";
    }

    if (user?.role === UserRole.BARBER) {
      if (lastMsg.includes('venda') || lastMsg.includes('produto')) {
        return "Dica de venda: apos o corte, mostre o resultado usando a pomada matte. Clientes que experimentam tem 3x mais chance de comprar. Ofereca com naturalidade!";
      }
      return "Estou aqui para ajudar com tecnicas de atendimento, dicas de venda e fidelizacao de clientes. Manda sua duvida!";
    }

    // Customer
    if (lastMsg.includes('horario') || lastMsg.includes('agendar') || lastMsg.includes('marcar')) {
      return "Voce pode agendar diretamente pela aba 'Reservar' no menu. Temos horarios disponiveis todos os dias uteis das 09:00 as 20:00!";
    }
    if (lastMsg.includes('preco') || lastMsg.includes('valor') || lastMsg.includes('quanto')) {
      return "Nossos precos: Corte R$ 50, Barba R$ 40, Combo (Corte + Barba) R$ 80 e Pezinho R$ 20. Confira todos os servicos na aba Reservar!";
    }
    return "Ola! Sou o assistente da Barvo. Posso ajudar com informacoes sobre servicos, precos e agendamentos. Como posso te ajudar?";

  } catch (error) {
    console.error("Chat Service Error:", error);
    return "Estou com dificuldades no momento. Tente novamente em instantes.";
  }
};
