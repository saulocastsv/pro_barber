import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Carrega as variáveis do .env baseado no modo (dev, production, etc)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Em vez de mapear todo o objeto, mapeamos apenas o necessário 
      // para o SDK do Google não reclamar
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      // Isso evita que o process.env inteiro seja sobrescrito como undefined
      'process.env': env 
    },
    server: {
      port: 3000,
    }
  };
});