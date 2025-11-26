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
Você é o assistente virtual inteligente da "BarberPro", uma barbearia premium.
Sua função é ajudar clientes a entenderem os serviços, preços e disponibilidade.
Você deve ser educado, direto e usar um tom masculino e moderno.

Dados da Barbearia:
- Serviços: ${SERVICES.map(s => `${s.name} (R$${s.price}, ${s.durationMinutes}min)`).join(', ')}.
- Barbeiros: ${MOCK_USERS.filter(u => u.role === 'BARBER').map(u => u.name).join(', ')}.
- Horário: Segunda a Sábado, das 09:00 às 20:00.

Se o cliente perguntar sobre agendamento, diga que ele pode clicar na aba "Agendar" ou perguntar a disponibilidade (simule uma checagem).
Se perguntar preço, responda com base na lista acima.
Mantenha as respostas curtas (máximo 2 parágrafos).
`;

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!aiClient) {
    return "Desculpe, meu sistema de IA não está configurado corretamente (API Key ausente).";
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

    return response.text || "Desculpe, não entendi.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ocorreu um erro ao processar sua mensagem. Tente novamente.";
  }
};
