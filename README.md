# 💈 BarberPro SaaS

Uma plataforma completa de gestão para barbearias (SaaS), construída com tecnologias modernas de web para oferecer agendamento inteligente, gestão financeira, CRM e assistência via IA.

## 🚀 Tecnologias

- **Frontend:** React 18, TypeScript, Vite
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide React
- **Gráficos:** Recharts
- **IA:** Google Gemini API (via `@google/genai`)

## 📂 Arquitetura do Projeto

Este projeto segue uma estrutura escalável baseada em "Features" e separação de conceitos, ideal para SaaS que tende a crescer.

```
barberpro-saas/
├── public/              # Assets estáticos (favicon, manifest)
├── src/
│   ├── assets/          # Imagens e estilos globais
│   ├── components/      # Componentes UI reutilizáveis
│   │   ├── common/      # Botões, Modais, Inputs genéricos
│   │   ├── layout/      # Sidebar, Header, Wrappers
│   │   └── ...          # Componentes específicos de features
│   ├── context/         # Estados globais (AuthContext, ThemeContext)
│   ├── hooks/           # Custom React Hooks (useAuth, useCart)
│   ├── services/        # Integrações com APIs (Gemini, Backend)
│   ├── types/           # Definições de Tipos TypeScript (Interfaces/Enums)
│   ├── utils/           # Funções auxiliares e constantes
│   ├── App.tsx          # Componente Raiz e Roteamento
│   └── main.tsx         # Entry point
├── .env                 # Variáveis de ambiente (NÃO COMITAR)
├── index.html           # HTML Entry point
└── vite.config.ts       # Configuração do Bundler
```

## 🛠️ Como Rodar Localmente

1. **Pré-requisitos:**
   - Node.js (v18 ou superior)
   - Gerenciador de pacotes (npm, yarn ou pnpm)

2. **Instalação:**
   ```bash
   # Clone o repositório
   git clone https://github.com/seu-usuario/barberpro-saas.git

   # Entre na pasta
   cd barberpro-saas

   # Instale as dependências
   npm install
   ```

3. **Configuração de Ambiente:**
   - Crie um arquivo `.env` na raiz do projeto copiando o exemplo:
     ```bash
     cp .env.example .env
     ```
   - Adicione sua API Key do Google Gemini no arquivo `.env`:
     ```env
     VITE_API_KEY=sua_chave_aqui
     ```

4. **Executar:**
   ```bash
   npm run dev
   ```
   O app estará disponível em `http://localhost:3000`.

## 📦 Deploy (Hospedagem)

Como este projeto é um SPA (Single Page Application) construído com Vite, ele pode ser hospedado gratuitamente em serviços como Vercel, Netlify ou Cloudflare Pages.

### Opção 1: Vercel (Recomendado)

A Vercel é otimizada para projetos React/Vite.

1. Crie uma conta em [vercel.com](https://vercel.com).
2. Instale a CLI da Vercel (opcional) ou conecte seu repositório GitHub via dashboard.
3. **No Dashboard da Vercel:**
   - Clique em "Add New Project".
   - Importe o repositório do `barberpro-saas`.
   - Em **Build and Output Settings**, o preset `Vite` deve ser detectado automaticamente (Build command: `npm run build`, Output dir: `dist`).
   - Em **Environment Variables**, adicione:
     - Key: `VITE_API_KEY`
     - Value: `Sua Chave do Google AI Studio`
   - Clique em **Deploy**.

### Opção 2: Netlify

1. Crie uma conta em [netlify.com](https://netlify.com).
2. Arraste a pasta `dist` (gerada após rodar `npm run build`) para o dropzone do Netlify OU conecte ao GitHub.
3. Se conectar ao GitHub:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Vá em **Site settings > Environment variables** e adicione `VITE_API_KEY`.

## 🔒 Segurança e Melhores Práticas

- **API Keys:** A chave do Gemini está sendo usada no lado do cliente (`client-side`). Em um ambiente de produção real de alta escala, recomenda-se criar um backend (Node.js/Python) para intermediar essas chamadas e não expor a chave no navegador.
- **Autenticação:** O sistema atual usa Mock Data. Para produção, integre com Firebase Auth, Auth0 ou Supabase.
- **Persistência:** Atualmente usa `localStorage` para carrinho. Para persistência robusta, conecte a um banco de dados (PostgreSQL/MongoDB).

## ✨ Funcionalidades Ativas

- [x] Dashboard Analítico (Dono/Barbeiro)
- [x] Agenda Inteligente e Visual
- [x] Sistema de Fila (Walk-in)
- [x] Loja Virtual com Carrinho Persistente
- [x] Gestão de Estoque e Alertas
- [x] CRM e Histórico de Clientes
- [x] Ferramentas de Marketing
- [x] Chatbot IA (Google Gemini)

---
Desenvolvido com ❤️ para modernizar barbearias.