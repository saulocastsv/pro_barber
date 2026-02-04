
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon } from 'lucide-react';
import { sendMessageToGemini, ChatMessage } from '../services/geminiService';
import { User, UserRole } from '../types';

interface ChatAssistantProps {
  currentUser: User | null;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Definir saudação inicial baseada no papel do usuário
  useEffect(() => {
    let greeting = 'Fala, parceiro! 👊 Sou o assistente da Barvo. Como posso te ajudar hoje? 💈🔥';
    
    if (currentUser?.role === UserRole.OWNER) {
      greeting = `Olá, Comandante ${currentUser.name.split(' ')[0]}! 📈 Estou pronto para te ajudar com insights de gestão, análise de lucros e estratégias para a Barvo crescer. O que vamos analisar hoje?`;
    } else if (currentUser?.role === UserRole.BARBER) {
      greeting = `E aí, fera! ✂️ Bora turbinar sua agenda? Posso criar legendas pro seu Insta, te ajudar a vender mais produtos ou sugerir como abordar aquele cliente difícil. Manda a braba!`;
    }

    // Reinicia o chat apenas se estiver vazio (evita resetar ao navegar)
    setMessages(prev => prev.length === 0 ? [{ role: 'assistant', text: greeting }] : prev);
  }, [currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    
    // Atualiza estado local imediatamente com a mensagem do usuário
    // Cria um novo array de histórico incluindo a nova mensagem
    const newHistory: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newHistory);
    
    setIsLoading(true);

    try {
      // Envia o histórico COMPLETO para o backend
      const reply = await sendMessageToGemini(newHistory, currentUser);
      
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Desculpe, tive um problema de conexão. Tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const getBotName = () => {
    if (currentUser?.role === UserRole.OWNER) return "Barvo Business AI";
    if (currentUser?.role === UserRole.BARBER) return "Barvo Sales Mentor";
    return "Suporte Barvo";
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50 transition-all transform hover:scale-110 flex items-center justify-center ${isOpen ? 'bg-red-500 rotate-90' : 'bg-brand-dark hover:bg-brand-dark/90'}`}
      >
        {isOpen ? <X color="white" /> : <MessageSquare color="white" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-fade-in h-[500px]">
          <div className="bg-brand-dark p-4 flex items-center gap-3">
             <div className="p-2 bg-brand-light rounded-full">
                <Bot size={20} className="text-brand-dark" />
             </div>
             <div>
                <h3 className="text-white font-bold">{getBotName()}</h3>
                <p className="text-brand-gray/50 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full block"></span> 
                    Inteligência Artificial Ativa
                </p>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
            {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-brand-light/30 text-brand-dark' : 'bg-brand-gray/10 text-brand-midGray'}`}>
                        {m.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${m.role === 'user' ? 'bg-brand-dark text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'}`}>
                        {m.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex gap-2">
                     <div className="w-8 h-8 rounded-full bg-brand-gray/10 flex items-center justify-center text-brand-midGray"><Bot size={14} /></div>
                     <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1 items-center">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                     </div>
                </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
                type="text" 
                className="flex-1 bg-slate-100 border-none rounded-full px-4 text-sm focus:ring-2 focus:ring-brand-light outline-none"
                placeholder="Pergunte qualquer coisa..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-brand-dark rounded-full text-white hover:bg-brand-dark/90 disabled:opacity-50 transition-colors"
            >
                <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
