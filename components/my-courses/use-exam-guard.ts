"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/**
 * Saídas que contam como uma só: trocar de janela dispara `blur` e
 * `visibilitychange`, e em alguns sistemas também sai do ecrã inteiro — tudo
 * no mesmo instante. Sem isto, um único Alt+Tab valia duas infracções.
 */
const SAME_EXIT_MS = 1500;

type Channel = "window" | "fullscreen";

interface ExamGuardOptions {
  /** Só durante a tentativa de um teste de módulo ou exame final. */
  active: boolean;
  /** O contentor que vai a ecrã inteiro. */
  containerRef: RefObject<HTMLElement | null>;
  /** Saídas toleradas com aviso; a seguinte submete. */
  maxWarnings: number;
  /** Ultrapassou as saídas toleradas — submeter com `LEFT_PAGE`. */
  onLimit: (violations: number) => void;
  /**
   * A página está a fechar (separador fechado, recarregar, navegar para fora)
   * ou o componente desmontou a meio — enviar as respostas por beacon.
   */
  onLeave: (violations: number) => void;
}

/**
 * Modo antifraude dos testes de módulo e do exame final.
 *
 * O que um browser deixa fazer, e só isso: detectar saídas (separador,
 * janela, ecrã inteiro), impedir copiar/colar/seleccionar/imprimir e os
 * atalhos óbvios, e reagir à tecla PrintScreen. Capturas de ecrã feitas pelo
 * sistema ou pelo telemóvel não se conseguem bloquear — daí a marca de água.
 */
export function useExamGuard({ active, containerRef, maxWarnings, onLimit, onLeave }: ExamGuardOptions) {
  const [violations, setViolations] = useState(0);
  const [warningOpen, setWarningOpen] = useState(false);
  const countRef = useRef(0);
  const lastExitAt = useRef(0);
  const away = useRef<Record<Channel, boolean>>({ window: false, fullscreen: false });
  const onLimitRef = useRef(onLimit);
  const onLeaveRef = useRef(onLeave);
  const activeRef = useRef(active);

  useEffect(() => {
    onLimitRef.current = onLimit;
    onLeaveRef.current = onLeave;
    activeRef.current = active;
  });

  useEffect(() => {
    if (!active) return;

    // Só conta sair do ecrã inteiro a quem lá esteve: onde o browser não o
    // suporta (iPhone) ou o recusou, não há saída a contar.
    let wasFullscreen = Boolean(document.fullscreenElement);

    const exit = (channel: Channel) => {
      if (away.current[channel]) return;
      away.current[channel] = true;

      const now = Date.now();
      const sameExit = now - lastExitAt.current < SAME_EXIT_MS;
      lastExitAt.current = now;
      if (sameExit) return;

      const n = ++countRef.current;
      setViolations(n);
      if (n > maxWarnings) onLimitRef.current(n);
      else setWarningOpen(true);
    };

    const back = (channel: Channel) => {
      away.current[channel] = false;
    };

    const onVisibility = () => (document.hidden ? exit("window") : back("window"));
    const onBlur = () => exit("window");
    const onFocus = () => back("window");
    const onFullscreen = () => {
      if (document.fullscreenElement) {
        wasFullscreen = true;
        back("fullscreen");
      } else if (wasFullscreen) {
        exit("fullscreen");
      }
    };

    const block = (e: Event) => e.preventDefault();
    const isEditable = (target: EventTarget | null) =>
      target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement;
    // Seleccionar só dentro da caixa de resposta, para o aluno poder editar
    // o que escreve. Colar continua bloqueado lá dentro também.
    const onSelectStart = (e: Event) => {
      if (!isEditable(e.target)) e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      const blocked =
        key === "f12" ||
        (mod && e.shiftKey && ["i", "j", "c"].includes(key)) ||
        (mod && ["c", "x", "v", "p", "s", "u"].includes(key)) ||
        (mod && key === "a" && !isEditable(e.target));
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // A tecla PrintScreen não se consegue cancelar — o sistema já tirou a
    // captura quando o evento chega. Esvazia-se a área de transferência (onde
    // o Windows a põe) e conta como saída.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "PrintScreen") return;
      navigator.clipboard?.writeText("").catch(() => {});
      exit("window");
      // Não houve perda de foco que a reponha.
      back("window");
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Browsers antigos só mostram o aviso com `returnValue` preenchido.
      e.returnValue = "";
    };
    const onPageHide = () => onLeaveRef.current(countRef.current);

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    document.addEventListener("selectstart", onSelectStart);
    for (const type of ["copy", "cut", "paste", "contextmenu", "dragstart", "drop"]) {
      document.addEventListener(type, block);
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreen);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("keyup", onKeyUp, true);
      document.removeEventListener("selectstart", onSelectStart);
      for (const type of ["copy", "cut", "paste", "contextmenu", "dragstart", "drop"]) {
        document.removeEventListener(type, block);
      }
    };
  }, [active, maxWarnings]);

  // Desmontar a meio também é sair: "Voltar à aula", um link da barra
  // lateral ou da navbar (onde não há ecrã inteiro a esconder) levam o aluno
  // para fora sem perda de foco nenhuma.
  useEffect(
    () => () => {
      if (activeRef.current) onLeaveRef.current(countRef.current);
    },
    [],
  );

  /** "Voltar ao ecrã inteiro" no aviso — o clique é o gesto que o browser exige. */
  const resume = useCallback(() => {
    setWarningOpen(false);
    const el = containerRef.current;
    if (el && !document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
  }, [containerRef]);

  /**
   * Cada tentativa começa do zero. É explícito, e não amarrado ao `active`:
   * uma submissão que falhe desliga e volta a ligar a guarda, e não pode
   * perdoar as saídas já feitas.
   */
  const reset = useCallback(() => {
    countRef.current = 0;
    lastExitAt.current = 0;
    away.current = { window: false, fullscreen: false };
    setViolations(0);
    setWarningOpen(false);
  }, []);

  return { violations, warningOpen, resume, reset };
}
