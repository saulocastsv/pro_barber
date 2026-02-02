import { GoogleGenAI } from "@google/genai";
import { SERVICES, MOCK_USERS } from "../constants";

// Inicialização segura conforme diretrizes
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
Você é o assistente virtual da "Barvo", uma barbearia premium e moderna. 💈
Sua personalidade é: Casual, amigável e parceiro. Fale como um barbeiro experiente conversando com um amigo.
Use emojis moderadamente (✂️, 🔥, 😎) para deixar a conversa dinâmica.

Dados da Barbearia Barvo:
- Serviços: ${SERVICES.map(s => `${s.name} (R$${s.price}, ${s.durationMinutes}min)`).join(', ')}.
- Barbeiros: ${MOCK_USERS.filter(u => u.role === 'BARBER').map(u => u.name).join(', ')}.
- Horário: Segunda a Sábado, das 09:00 às 20:00.

Instruções:
1. Responda de forma curta e objetiva.
2. Sempre incentive o agendamento na plataforma.
3. Se perguntarem sobre preço, informe e pergunte: "Bora agendar um horário?"
`;

export const sendMessageToGemini = async (message: string): Promise<string> => {
  const ai = getAiClient();
  
  if (!ai) {
    return "Opa! Meu sistema está em manutenção técnica (sem chave de API). Logo volto a te ajudar! 😅";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "Entendi... mas não consegui formular a resposta. Pode repetir?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Deu um probleminha na minha conexão agora. Tenta de novo em um minuto? 👊";
  }
};