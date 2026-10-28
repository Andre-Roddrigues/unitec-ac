"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, MessageSquareText, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createInteractionRequest,
  getMyInteractions,
  type InteractionRequest,
} from "@/actions/interaction-actions";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AskInstructorModal({
  open,
  onClose,
  enrollmentId,
}: {
  open: boolean;
  onClose: () => void;
  enrollmentId?: string;
}) {
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<InteractionRequest[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const prevOpen = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getMyInteractions();
    // `/interactions/mine` devolve as perguntas de todos os cursos; aberto
    // dentro de um curso, o histórico só deve mostrar as dele.
    if (res.success) {
      const all = res.data ?? [];
      setHistory(enrollmentId ? all.filter((i) => i.enrollmentId === enrollmentId) : all);
    }
    setLoading(false);
  }, [enrollmentId]);

  useEffect(() => {
    if (open && !prevOpen.current) {
      setQuestion("");
      load();
    }
    prevOpen.current = open;
  }, [open, load]);

  const send = async () => {
    if (!enrollmentId) {
      toast.error("Não foi possível identificar a matrícula para enviar a dúvida.");
      return;
    }
    if (question.trim().length < 10) {
      toast.error("A dúvida deve ter no mínimo 10 caracteres.");
      return;
    }
    setSending(true);
    const res = await createInteractionRequest(enrollmentId, question.trim());
    setSending(false);
    if (res.success) {
      toast.success("Dúvida enviada ao formador!");
      setQuestion("");
      load();
    } else {
      toast.error(res.message || "Falha ao enviar a dúvida");
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-elevated transition-all",
          open ? "translate-y-0" : "translate-y-4",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <MessageSquareText className="size-5 text-primary" />
            Fazer pergunta ao formador
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">A sua dúvida</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Escreva a sua dúvida para o formador… (mín. 10 caracteres)"
              rows={4}
              maxLength={2000}
            />
            <p className="text-right text-xs text-muted-foreground">{question.length}/2000</p>
          </div>

          <Button
            className="w-full cursor-pointer"
            onClick={send}
            disabled={sending || question.trim().length < 10}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Enviar pergunta
          </Button>
        </div>

        <div className="border-t border-border bg-muted/20 p-5">
          <h3 className="mb-3 text-sm font-semibold">Histórico de perguntas</h3>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Ainda não submeteu nenhuma pergunta.
            </p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {history.map((item) => (
                <li key={item.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm">{item.question}</p>
                      {/* `status`/`respondedAt` vinham da API e não eram
                          mostrados: o aluno tinha de abrir cada pergunta para
                          descobrir se já lhe tinham respondido. */}
                      <p className="text-xs text-muted-foreground">
                        {item.response ? (
                          <span className="font-medium text-success">Respondida</span>
                        ) : (
                          "À espera de resposta"
                        )}
                        {item.respondedAt && ` · ${formatDate(item.respondedAt)}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 cursor-pointer"
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      aria-label="Expandir resposta"
                    >
                      <ChevronDown
                        className={cn("size-4 transition-transform", expanded === item.id && "rotate-180")}
                      />
                    </Button>
                  </div>
                  {expanded === item.id && item.response && (
                    <p className="mt-2 border-t border-border pt-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Resposta do formador: </span>
                      {item.response}
                    </p>
                  )}
                  {expanded === item.id && !item.response && (
                    <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                      Ainda sem resposta do formador.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
