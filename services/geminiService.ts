
import { GoogleGenAI } from "@google/genai";
import { SERVICES } from "../constants";
import { User, UserRole } from "../types";

/**
 * System instruction generator based on user role
 */
const getSystemInstruction = (user: User | null) => {
  const baseData = `
    Dados da Barbearia Barvo:
    - Serviços: ${SERVICES.map(s => `${s.name} (R$${s.price})`).join(', ')}.
    - Horário: Seg-Sáb, 09h às 20h.
    - Endereço: Rua Augusta, 1500, SP.
  `;

  if (!user || user.role === UserRole.CUSTOMER) {
    return `
      Você é o Assistente de Suporte da Barvo. 💈
      Personalidade: Casual, prestativo e ágil.
      Objetivo: Tirar dúvidas de clientes sobre horários, preços, localização e ajudar no agendamento.
      Sempre incentive o cliente a agendar um horário pelo app.
      ${baseData}
    `;
  }

  if (user.role === UserRole.BARBER) {
    return `
      Você é o Mentor de Vendas e Carreira para os Barbeiros da Barvo. ✂️🔥
      Personalidade: Motivador, especialista em marketing pessoal e vendas.
      Objetivo: 
      1. Ajudar o barbeiro a vender mais serviços (ex: sugerir barba quando o cliente pede só corte).
      2. Criar legendas estratégicas para Instagram/TikTok focadas em cortes masculinos.
      3. Dar dicas de como abordar o cliente para vender produtos da loja (pomadas, óleos).
      4. Sugerir planos de conteúdo semanais para as redes sociais do barbeiro.
      Seja direto, use gírias do meio da barbearia mas mantenha o profissionalismo.
    `;
  }

  if (user.role === UserRole.OWNER) {
    return `
      Você é o Consultor Estratégico de Gestão da Barvo (Business Intelligence). 📈
      Personalidade: Analítico, visionário e focado em lucro.
      Objetivo:
      1. Dar insights sobre como melhorar o MRR (Receita Recorrente) e diminuir o Churn.
      2. Sugerir ações de marketing para períodos de baixo movimento.
      3. Apoiar na gestão de equipe e redução de custos operacionais.
      4. Explicar conceitos técnicos de gestão (LTV, CAC, Margem de Contribuição).
      ${baseData}
    `;
  }

  return "Você é um assistente geral da barbearia Barvo.";
};

/**
 * Send message to Gemini API following the official guidelines
 */
export const sendMessageToGemini = async (message: string, user: User | null): Promise<string> => {
  // Always initialize with apiKey parameter from process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Select model based on task complexity
  // Owners get gemini-3-pro-preview for strategic reasoning (Complex Text Task)
  const modelName = user?.role === UserRole.OWNER ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: message,
      config: {
        systemInstruction: getSystemInstruction(user),
        temperature: 0.8,
      }
    });

    // Access .text property directly (correct property access)
    return response.text || "Entendi... mas não consegui formular a resposta. Pode repetir?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Deu um probleminha na minha conexão agora. Tenta de novo em um minuto? 👊";
  }
};
