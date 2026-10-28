"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * Segundos que o aluno passou com esta aula aberta, contados só enquanto o
 * separador está visível. Reinicia sempre que a aula muda.
 *
 * Continua a ser a medida usada para `LessonProgress.watchedDuration` mesmo
 * agora que os players (nativo e Vimeo, ver `lesson-viewer.tsx`) já disparam
 * `onCompleted` sozinhos — a conclusão em si já não depende disto, mas há
 * aulas sem vídeo nenhum (documento, quiz) onde este cronómetro continua a
 * ser a única fonte de "tempo passado nesta aula".
 */
export function useTimeOnLesson(lessonId: string | null) {
  const secondsRef = useRef(0);

  useEffect(() => {
    secondsRef.current = 0;
    if (!lessonId) return;

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") secondsRef.current += 1;
    }, 1000);

    return () => window.clearInterval(timer);
  }, [lessonId]);

  const read = useCallback(() => secondsRef.current, []);
  const reset = useCallback(() => {
    secondsRef.current = 0;
  }, []);

  return useMemo(() => ({ read, reset }), [read, reset]);
}
