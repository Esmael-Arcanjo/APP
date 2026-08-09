import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import api from '../services/api';

const VirtualAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! Sou o assistente virtual do WIBAZA. Como posso ajudar você hoje?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chatbot/message', {
        message: input,
        conversation_history: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        data-testid="virtual-assistant-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform z-30 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-36 md:bottom-24 right-4 md:right-6 w-[calc(100vw-2rem)] max-w-sm md:w-96 h-[calc(100vh-12rem)] md:h-[500px] max-h-[500px] bg-surface border border-border rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-border bg-primary text-primary-foreground flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-bold">Assistente WIBAZA</h3>
                <p className="text-xs opacity-80">Online agora</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-muted">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border flex gap-2">
              <input
                data-testid="virtual-assistant-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                data-testid="virtual-assistant-send"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VirtualAssistant;
