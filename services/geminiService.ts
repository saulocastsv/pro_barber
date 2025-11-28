import { GoogleGenAI } from "@google/genai";
import { SERVICES, MOCK_USERS } from "../constants";

let aiClient: GoogleGenAI | null = null;

// Initialize the client safely
try {
  if (process.env.API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI", error);
}

const SYSTEM_INSTRUCTION = `
Você é o assistente virtual da "BarberPro", uma barbearia premium e moderna. 💈
Sua personalidade é: Casual, amigável, "gente boa" e parceiro. Fale como um barbeiro experiente conversando com um amigo. 👊
Use emojis (✂️, 🔥, 😎, 📅, ✅) para deixar a conversa leve e dinâmica.

Dados da Barbearia:
- Serviços: ${SERVICES.map(s => `${s.name} (R$${s.price}, ${s.durationMinutes}min)`).join(', ')}.
- Barbeiros: ${MOCK_USERS.filter(u => u.role === 'BARBER').map(u => u.name).join(', ')}.
- Horário: Segunda a Sábado, das 09:00 às 20:00.

Regras de Resposta:
1. Se perguntarem preço, passe a informação e já mande um "Bora agendar esse tapa no visual? 😎".
2. Se perguntarem sobre agendamento, diga para usar a aba "Reservar" ou perguntar a disponibilidade aqui mesmo.
3. Mantenha as respostas curtas e diretas, sem textão.
`;

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!aiClient) {
    return "Eita, parceiro! Meu sistema tá sem a chave de API conectada. 😅 Dá um toque no admin.";
  }

  try {
    const model = aiClient.models;
    const response = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "Putz, não entendi muito bem. Manda de novo? 🤔";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Deu um probleminha aqui na nossa conexão. Tenta de novo já já! 👊";
  }
};