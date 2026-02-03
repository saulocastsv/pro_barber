import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configuração de Segurança Básica
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Inicialização da IA (Segura no Server-Side)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Mock de Serviços para Contexto da IA (Idealmente viria do banco de dados)
const SERVICES_CONTEXT = [
  { name: 'Corte de Cabelo', price: 50 },
  { name: 'Barba Terapia', price: 40 },
  { name: 'Combo (Corte + Barba)', price: 80 },
  { name: 'Pezinho / Acabamento', price: 20 },
];

const getSystemInstruction = (role) => {
  const baseData = `
    Dados da Barbearia Barvo:
    - Serviços: ${SERVICES_CONTEXT.map(s => `${s.name} (R$${s.price})`).join(', ')}.
    - Horário: Seg-Sáb, 09h às 20h.
    - Endereço: Rua Augusta, 1500, SP.
  `;

  if (role === 'CUSTOMER') {
    return `Você é o Assistente de Suporte da Barvo. ${baseData} Seja educado, breve e útil.`;
  }
  if (role === 'BARBER') {
    return `Você é o Mentor de Vendas e Carreira para os Barbeiros da Barvo. ✂️🔥`;
  }
  if (role === 'OWNER') {
    return `Você é o Consultor Estratégico de Gestão da Barvo. 📈 ${baseData}`;
  }
  return "Você é um assistente geral da barbearia Barvo.";
};

app.post('/api/chat', async (req, res) => {
  try {
    const { message, userRole } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Seleção de modelo baseada no tier do usuário (exemplo de lógica de negócio no back)
    const modelName = userRole === 'OWNER' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: message,
      config: {
        systemInstruction: getSystemInstruction(userRole || 'CUSTOMER'),
        temperature: 0.8,
      }
    });

    res.json({ text: response.text });

  } catch (error) {
    console.error('Erro no servidor Gemini:', error);
    // Tratamento de erro robusto: não vaza stack trace para o cliente
    res.status(500).json({ 
      error: 'Erro interno ao processar inteligência artificial.',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor Barvo rodando na porta ${port}`);
  console.log(`🔒 Modo Seguro: API Key gerenciada pelo servidor.`);
});
