"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, FileText, Loader2, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Vive num ficheiro à parte **de propósito**: o `react-pdf`/`pdfjs-dist`
 * precisa de APIs do browser (`DOMMatrix`) e rebenta a renderizar no
 * servidor. Quem o usa importa-o com `next/dynamic` + `ssr: false` (ver
 * `lesson-viewer.tsx`), o que mantém o pdfjs fora do bundle do servidor.
 */
try {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
} catch {
  // fall back to react-pdf default worker
}

// A pré-visualização ocupa a largura do próprio cartão da aula — só o
// ecrã inteiro (que também usa este tecto) precisa de um limite próprio,
// porque aí o contentor é o ecrã inteiro.
const COMPACT_MAX_WIDTH = 900;
const FULLSCREEN_MAX_WIDTH = 900;

/**
 * Mede a largura disponível do contentor, capada a `maxWidth`. Substitui o
 * `width` fixo (900px) que a versão anterior passava ao `<Page>` — um
 * canvas com esse tamanho não encolhe dentro de uma grid `1fr`, por isso
 * empurrava a coluna lateral do curso para fora do ecrã em vez de encolher.
 */
function useContainerWidth(maxWidth: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(maxWidth);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(1, Math.min(maxWidth, Math.floor(entry.contentRect.width))));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxWidth]);

  return { ref, width };
}

function PageSpinner() {
  return <Loader2 className="my-10 size-6 animate-spin text-muted-foreground" />;
}

/**
 * Ecrã inteiro — todas as páginas empilhadas, com scroll, em vez de uma de
 * cada vez: é isto que "rolar entre as páginas" pede, e só faz sentido com
 * espaço a sério (a pré-visualização compacta fica com paginação).
 *
 * Autónomo de propósito (carrega o próprio `<Document>`, não recebe
 * `numPages` de fora): assim serve tanto ao botão "ecrã inteiro" do
 * `PdfViewer` como ao "Abrir" de `LessonMaterials`, que nunca chegou a
 * montar nenhuma pré-visualização antes de o aluno clicar.
 */
export function PdfFullscreen({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const { ref, width } = useContainerWidth(FULLSCREEN_MAX_WIDTH);
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <FileText className="size-4 shrink-0 text-primary" />
          <span className="truncate">{title}</span>
        </p>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fechar ecrã inteiro">
          <X className="size-4" />
        </Button>
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto bg-muted/30 px-4 py-6">
        {error ? (
          <div className="grid place-items-center py-16 text-center text-sm text-muted-foreground">
            <p>
              Não foi possível pré-visualizar o PDF.{" "}
              <a href={url} target="_blank" rel="noreferrer" className="text-primary underline">
                Abrir o documento
              </a>
            </p>
          </div>
        ) : (
          <Document
            file={url}
            onLoadSuccess={({ numPages }: { numPages: number }) => setNumPages(numPages)}
            onLoadError={() => setError(true)}
            loading={<PageSpinner />}
            className="mx-auto flex w-fit flex-col items-center gap-4"
          >
            {Array.from({ length: numPages }, (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                width={width}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={<PageSpinner />}
                className="overflow-hidden rounded-lg border border-border shadow-sm"
              />
            ))}
          </Document>
        )}
      </div>
    </div>
  );
}

export function PdfViewer({ url, title }: { url: string; title: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const { ref, width } = useContainerWidth(COMPACT_MAX_WIDTH);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <p className="flex min-w-0 items-center gap-2 font-medium">
          <FileText className="size-4 shrink-0 text-primary" />
          <span className="truncate">{title}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {numPages > 0 && (
            <p className="text-xs text-muted-foreground">
              Página {page} de {numPages}
            </p>
          )}
          {numPages > 0 && !error && (
            <Button variant="outline" size="icon-xs" onClick={() => setFullscreen(true)} title="Abrir em ecrã inteiro">
              <Maximize2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div ref={ref} className="flex w-full max-h-[75vh] justify-center overflow-auto rounded-xl border border-border bg-muted/30 p-2">
        {loading && (
          <div className="grid aspect-4/3 place-items-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {error ? (
          <div className="grid aspect-4/3 place-items-center p-6 text-center text-sm text-muted-foreground">
            <p>
              Não foi possível pré-visualizar o PDF.{" "}
              <a href={url} target="_blank" rel="noreferrer" className="text-primary underline">
                Abrir o documento
              </a>
            </p>
          </div>
        ) : (
          <Document
            file={url}
            onLoadSuccess={({ numPages }: { numPages: number }) => {
              setNumPages(numPages);
              setLoading(false);
            }}
            onLoadError={() => {
              setError(true);
              setLoading(false);
            }}
            loading={<PageSpinner />}
          >
            <Page
              pageNumber={page}
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={<PageSpinner />}
            />
          </Document>
        )}
      </div>
      {numPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="size-4" /> Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= numPages}
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
          >
            Seguinte <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
      {fullscreen && <PdfFullscreen url={url} title={title} onClose={() => setFullscreen(false)} />}
    </div>
  );
}
