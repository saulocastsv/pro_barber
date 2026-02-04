import { GoogleGenAI } from "@google/genai";
import { User, UserRole } from "../types";

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

/**
 * Envia o histórico de conversa para o Google Gemini.
 * Utiliza o SDK oficial @google/genai.
 */
export const sendMessageToGemini = async (history: ChatMessage[], user: User | null): Promise<string> => {
  try {
    // Inicialização correta conforme diretrizes
    // O process.env.API_KEY é injetado pelo Vite via define no vite.config.ts
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Definição do modelo baseado no papel do usuário
    // Owner/Barber -> Tarefas complexas -> gemini-3-pro-preview
    // Customer -> Tarefas básicas -> gemini-3-flash-preview
    let modelId = 'gemini-3-flash-preview';
    let systemInstruction = 'Você é um assistente virtual da Barbearia Barvo.';

    if (user?.role === UserRole.OWNER) {
      modelId = 'gemini-3-pro-preview';
      systemInstruction += ' Atue como um consultor estratégico de negócios, focado em gestão, finanças e crescimento.';
    } else if (user?.role === UserRole.BARBER) {
      modelId = 'gemini-3-pro-preview';
      systemInstruction += ' Atue como um mentor profissional, focado em técnicas de vendas, atendimento e fidelização.';
    } else {
      systemInstruction += ' Ajude o cliente com agendamentos, dúvidas sobre serviços e produtos. Seja cordial e breve.';
    }

    // Formata o histórico para o formato esperado pelo SDK (Content[])
    const contents = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "Não consegui formular uma resposta no momento.";

  } catch (error) {
    console.error("Chat Service Error:", error);
    return "Estou com dificuldades de conexão com a inteligência artificial. Tente novamente em instantes.";
  }
};