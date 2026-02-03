
import { User } from "../types";

/**
 * Envia mensagem para o Backend (BFF) que gerencia a comunicação segura com o Gemini.
 * A chave de API agora reside exclusivamente no servidor Node.js.
 */
export const sendMessageToGemini = async (message: string, user: User | null): Promise<string> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  try {
    const response = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userRole: user?.role || 'CUSTOMER',
        userId: user?.id // Passando ID caso queira implementar histórico no futuro
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro na comunicação com o servidor');
    }

    const data = await response.json();
    return data.text || "Não consegui formular uma resposta no momento.";

  } catch (error) {
    console.error("Chat Service Error:", error);
    return "Estou com dificuldades de conexão com o servidor da barbearia. Tente novamente em instantes.";
  }
};
