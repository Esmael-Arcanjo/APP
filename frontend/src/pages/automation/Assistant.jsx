import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Bot, Send, User } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { api, errMsg } from "@/lib/api";

const SESSION = "default";

export default function Assistant() {
  const { projectId } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      const { data } = await api.get("/dashboard/automation/assistant/messages", {
        params: { project_id: projectId, session_id: SESSION },
      });
      setMessages(data.data || []);
    } catch { /* empty */ }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text, _local: true }]);
    setLoading(true);
    try {
      const { data } = await api.post("/dashboard/automation/assistant/chat",
        { session_id: SESSION, message: text }, { params: { project_id: projectId } });
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        testId="assistant-header"
        title="Assistente WhatsApp"
        subtitle="IA responde clientes, agenda e qualifica leads 24 horas por dia, 7 dias por semana."
      />

      <div className="ls-card flex h-[62vh] flex-col overflow-hidden">
        <div ref={scrollRef} data-testid="assistant-messages" className="ls-scroll flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && !loading && (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Bot className="h-6 w-6" /></span>
              <p className="text-sm">Converse como um cliente do seu negócio.<br />A IA responde, agenda e qualifica leads.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} data-testid={`message-${m.role}`} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </span>
              <div className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "ls-surface"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground"><Bot className="h-4 w-4" /></span>
              <div className="rounded-2xl ls-surface px-4 py-2.5 text-sm text-muted-foreground">Digitando…</div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-center gap-2 border-t border-border p-3"
        >
          <Input
            data-testid="whatsapp-ai-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva como um cliente…"
            className="h-11 rounded-full"
          />
          <Button data-testid="assistant-send-btn" type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-full" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
