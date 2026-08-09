import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, X, Send, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Small discreet chat widget: user <-> vendor / user <-> admin
// Renders a tiny circular button bottom-left. Hidden for guests.
const SupportChat = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('list'); // list | thread
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null); // { conversation_id, other_user_id, other_name }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const wsRef = useRef(null);
  const bottomRef = useRef(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  const wsUrl = useMemo(() => {
    if (!user?.id || !backendUrl) return null;
    return backendUrl.replace(/^http/, 'ws') + `/ws/chat/${user.id}`;
  }, [user, backendUrl]);

  const loadConversations = async () => {
    if (!user?.id) return;
    try {
      const { data } = await api.get('/chat/conversations', { params: { user_id: user.id } });
      setConversations(data || []);
    } catch (_) {}
  };

  const loadMessages = async (conversation_id) => {
    try {
      const { data } = await api.get(`/chat/messages/${conversation_id}`);
      setMessages(data || []);
    } catch (_) { setMessages([]); }
  };

  useEffect(() => {
    if (!open || !user) return;
    loadConversations();
  }, [open, user]);

  useEffect(() => {
    if (!wsUrl || !open) return;
    let ws;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          if (payload?.type === 'new_message' || payload?.type === 'message_sent') {
            const msg = payload.data;
            if (activeConv && msg.conversation_id === activeConv.conversation_id) {
              setMessages((prev) => [...prev, msg]);
            }
            loadConversations();
          }
        } catch (_) {}
      };
      ws.onerror = () => {};
    } catch (_) {}
    return () => { try { ws && ws.close(); } catch (_) {} };
  }, [wsUrl, open, activeConv]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openThread = async (conv) => {
    setActiveConv(conv);
    setTab('thread');
    await loadMessages(conv.conversation_id);
  };

  const startAdminChat = () => {
    // Simple convention: conversation with "admin" is deterministic per user
    const conv = { conversation_id: `admin-${user.id}`, other_user_id: 'admin', other_name: 'Suporte WIBAZA' };
    openThread(conv);
  };

  const send = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== 1 || !activeConv) return;
    const payload = {
      conversation_id: activeConv.conversation_id,
      receiver_id: activeConv.other_user_id,
      message: input.trim(),
      sender_role: user.role,
    };
    wsRef.current.send(JSON.stringify(payload));
    setInput('');
  };

  if (!user) return null;

  return (
    <>
      <button
        data-testid="support-chat-toggle"
        onClick={() => setOpen((v) => !v)}
        title="Chat de Suporte"
        className="fixed bottom-20 md:bottom-6 left-4 md:left-6 w-11 h-11 rounded-full bg-secondary text-secondary-foreground shadow-md hover:scale-105 transition-transform z-30 flex items-center justify-center border border-border"
      >
        {open ? <X className="w-5 h-5" /> : <LifeBuoy className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-36 md:bottom-24 left-4 md:left-6 w-[calc(100vw-2rem)] max-w-xs md:w-80 h-[420px] bg-surface border border-border rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden"
            data-testid="support-chat-window"
          >
            <div className="p-3 border-b border-border bg-secondary text-secondary-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5" />
                <div>
                  <p className="font-bold text-sm">Chat de Suporte</p>
                  <p className="text-[10px] opacity-70">
                    {tab === 'thread' && activeConv ? activeConv.other_name : 'Conversas'}
                  </p>
                </div>
              </div>
              {tab === 'thread' && (
                <button onClick={() => setTab('list')} className="text-xs underline">Voltar</button>
              )}
            </div>

            {tab === 'list' && (
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {user.role === 'client' && (
                  <button
                    onClick={startAdminChat}
                    data-testid="support-chat-admin-btn"
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Falar com Suporte</span>
                  </button>
                )}
                {conversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Nenhuma conversa ainda.</p>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.conversation_id}
                      onClick={() => openThread({ ...c, other_name: c.other_user_id === 'admin' ? 'Suporte' : 'Usuário' })}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">{c.other_user_id === 'admin' ? 'Suporte' : 'Conversa'}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{c.last_message}</p>
                      </div>
                      {c.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                          {c.unread_count}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}

            {tab === 'thread' && (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Envie a primeira mensagem.</p>
                  ) : (
                    messages.map((m, i) => (
                      <div key={i} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-sm ${m.sender_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          {m.message}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>
                <div className="p-2 border-t border-border flex gap-2">
                  <input
                    data-testid="support-chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder="Escreva..."
                    className="flex-1 px-3 py-1.5 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <button data-testid="support-chat-send" onClick={send} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportChat;
