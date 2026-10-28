"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Archive,
  Code2,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Link2 as LinkIcon,
  Loader2,
  Paperclip,
  PlayCircle,
  Radio,
} from "lucide-react";
import { QuizViewer } from "@/components/my-courses/quiz-viewer";
import { VimeoPlayer } from "@/components/video/vimeo-player";
import { extractVimeoHash, extractVimeoId } from "@/lib/vimeo";
import type { Lesson, LessonResource, Module } from "@/types";

/** O `react-pdf` depende de APIs do browser (`DOMMatrix`) e rebentava a
 *  renderizar no servidor — por isso entra só no cliente. Sem isto, qualquer
 *  aula com um PDF anexado devolvia 500. */
const PdfViewer = dynamic(() => import("@/components/my-courses/pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="grid aspect-video place-items-center rounded-xl border border-border bg-muted/30">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

/** Ecrã inteiro do PDF, sem a pré-visualização compacta à volta — é o que
 *  "Abrir" usa em `LessonMaterials` para mostrar um PDF anexado sem sair da
 *  página (antes navegava para o URL em separador novo). */
const PdfFullscreenViewer = dynamic(
  () => import("@/components/my-courses/pdf-viewer").then((m) => m.PdfFullscreen),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

interface ViewerProps {
  lesson: Lesson;
  module: Module;
  thumbnailUrl: string;
  courseTitle: string;
  onCompleted?: () => void;
  /** De onde retomar (`LessonProgress.watchedDuration`). */
  initialPositionSeconds?: number;
  /** Aula seguinte do curso — o ecrã final do vídeo Vimeo oferece-a. Ausente na
   *  última aula e na demonstração (`lesson-preview-modal`). */
  nextLesson?: { title: string; onSelect: () => void };
}

/* ------------------------------------------------------------------ */
/* Vídeo — despacha por provider (ver LessonResource.provider). Cada    */
/* provider sabe detectar a sua própria conclusão; "external"/sem       */
/* provider tenta reconhecer Vimeo pelo URL como último recurso, para   */
/* linhas antigas de antes desta migração continuarem a funcionar.      */
/* ------------------------------------------------------------------ */

function pickVideoResource(resources: LessonResource[] | undefined): LessonResource | undefined {
  return (resources ?? []).find(
    (r) =>
      r.resourceType === "VIDEO" ||
      r.type === "VIDEO" ||
      // `url` pode vir vazio em linhas antigas — sem esta guarda o regex
      // rebentava e derrubava o leitor inteiro.
      (Boolean(r.url) && /vimeo|player\.vimeo/i.test(r.url)),
  );
}

/** Providers cujo ficheiro se serve directamente a um `<video>`: Cloudinary,
 *  disco local do LMS e MinIO self-hosted. O Vimeo é o caso à parte (iframe
 *  controlado pelo SDK), tratado em `VimeoViewer`. */
const NATIVE_VIDEO_PROVIDERS = ["cloudinary", "local", "minio"];

/** Tipos de recurso que servem de corpo a uma aula de documento — espelha o
 *  `enum ResourceType` do LMS menos VIDEO (esse é o leitor de vídeo). */
const DOCUMENT_RESOURCE_TYPES = ["DOCUMENT", "PDF", "ZIP", "LINK", "IMAGE", "CODE"];

/** Sem vídeo carregado, dizer isso — em vez da miniatura do curso com um botão
 *  de play decorativo que não fazia nada e deixava o aluno a clicar às cegas. */
function VideoPlaceholder({ module }: ViewerProps) {
  return (
    <div className="grid aspect-video place-items-center rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
      <div className="space-y-2">
        <PlayCircle className="mx-auto size-10 text-muted-foreground/50" />
        {/* O título da aula já está logo abaixo do leitor (ver `LessonViewer`). */}
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {module.title}
        </p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          O vídeo desta aula ainda não está disponível. Os materiais da aula, se existirem, estão
          abaixo.
        </p>
      </div>
    </div>
  );
}

/** Cloudinary, disco local ou MinIO — `<video>` nativo (ver
 *  NATIVE_VIDEO_PROVIDERS), com os controlos do próprio browser. */
function NativeVideoViewer({
  video,
  onCompleted,
  initialPositionSeconds,
  thumbnailUrl,
}: {
  video: LessonResource;
  onCompleted?: () => void;
  initialPositionSeconds?: number;
  thumbnailUrl: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const firedRef = useRef(false);

  const fireOnce = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    onCompleted?.();
  }, [onCompleted]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        poster={video.thumbnailUrl || thumbnailUrl}
        controlsList="nodownload"
        className="aspect-video w-full"
        onEnded={fireOnce}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration && el.currentTime / el.duration >= 0.95) fireOnce();
        }}
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          // Não retoma nos últimos segundos — evita reabrir uma aula já
          // vista e cair exactamente no fim, sem conseguir voltar a vê-la.
          if (initialPositionSeconds && initialPositionSeconds > 0 && initialPositionSeconds < el.duration - 5) {
            el.currentTime = initialPositionSeconds;
          }
        }}
      >
        <source src={video.url} />
      </video>
    </div>
  );
}

/** Vimeo — sem interface nenhuma do Vimeo (logo, título, partilha, ecrã de
 *  "mais vídeos"): os controlos, o logo e o ecrã final são da Unitec, ver
 *  `VimeoPlayer`. É também ele que detecta a conclusão e retoma a posição. */
function VimeoViewer({
  lesson,
  vimeoId,
  vimeoHash,
  onCompleted,
  initialPositionSeconds,
  nextLesson,
}: {
  lesson: Lesson;
  vimeoId: string;
  vimeoHash?: string | null;
  onCompleted?: () => void;
  initialPositionSeconds?: number;
  nextLesson?: ViewerProps["nextLesson"];
}) {
  return (
    <VimeoPlayer
      // Uma aula nova é um player novo — sem isto o estado (tempo, ecrã final,
      // "já concluída") passava de uma aula para a outra.
      key={`${lesson.id}-${vimeoId}`}
      vimeoId={vimeoId}
      vimeoHash={vimeoHash}
      title={lesson.title}
      autoplay
      initialPositionSeconds={initialPositionSeconds}
      onCompleted={onCompleted}
      next={nextLesson}
      className="rounded-xl border border-border"
    />
  );
}

type VideoPlayback =
  | { kind: "native"; video: LessonResource }
  | { kind: "vimeo"; video: LessonResource; vimeoId: string; vimeoHash: string | null };

/** Como (e se) o vídeo da aula toca. `null` = cai no placeholder — e então o
 *  recurso não está a ecrã, pelo que `primaryResourceIds` o deixa na lista de
 *  materiais em vez de o esconder. */
function resolveVideoPlayback(resources: LessonResource[] | undefined): VideoPlayback | null {
  const video = pickVideoResource(resources);
  if (!video) return null;
  // O backend devolve o enum do Prisma tal como está gravado — maiúsculas
  // ("VIMEO", "CLOUDINARY") — por isso a comparação normaliza aqui, em vez
  // de assumir que o provider já chega em minúsculas.
  const provider = video.provider?.toLowerCase();

  if (provider && NATIVE_VIDEO_PROVIDERS.includes(provider)) {
    return { kind: "native", video };
  }

  // "vimeo" já vem marcado pelo backend; "external"/sem provider (linhas
  // anteriores a esta migração) ainda tenta reconhecer Vimeo pelo próprio
  // URL, para não regredir nenhum vídeo já colado.
  const vimeoId =
    provider === "vimeo" ? extractVimeoId(video.url) : extractVimeoId(video.url || video.name || null);

  return vimeoId ? { kind: "vimeo", video, vimeoId, vimeoHash: extractVimeoHash(video.url) } : null;
}

function VideoViewer(props: ViewerProps) {
  const { lesson, onCompleted, thumbnailUrl, initialPositionSeconds, nextLesson } = props;
  const playback = useMemo(() => resolveVideoPlayback(lesson.resources), [lesson.resources]);

  if (playback?.kind === "native") {
    return (
      <NativeVideoViewer
        video={playback.video}
        onCompleted={onCompleted}
        initialPositionSeconds={initialPositionSeconds}
        thumbnailUrl={thumbnailUrl}
      />
    );
  }

  if (playback?.kind === "vimeo") {
    return (
      <VimeoViewer
        lesson={lesson}
        vimeoId={playback.vimeoId}
        vimeoHash={playback.vimeoHash}
        onCompleted={onCompleted}
        initialPositionSeconds={initialPositionSeconds}
        nextLesson={nextLesson}
      />
    );
  }

  return <VideoPlaceholder {...props} />;
}

/* ------------------------------------------------------------------ */
/* Live viewer                                                         */
/* ------------------------------------------------------------------ */

function LiveViewer({ lesson, module }: ViewerProps) {
  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-xl border border-border bg-muted/40 p-8 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-primary-soft">
        <Radio className="size-6 text-primary" />
      </span>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {module.title}
      </p>
      <h2 className="font-display text-xl font-bold tracking-tight">{lesson.title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Esta é uma sessão ao vivo. A gravação fica disponível aqui algumas horas depois do fim da
        transmissão.
      </p>
      {/* "Adicionar ao calendário" não fazia nada — e não podia: a aula não
          tem data marcada em lado nenhum do modelo de dados. */}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Document viewer — PDF inline (react-pdf) / PPTX via Office viewer   */
/* ------------------------------------------------------------------ */

function isPdfUrl(url?: string | null): boolean {
  return Boolean(url) && /\.pdf(\?|#|$)/i.test(url as string);
}

function isPptxUrl(url?: string | null): boolean {
  return Boolean(url) && /\.pptx?(\?|#|$)/i.test(url as string);
}

/** O MinIO guarda as chaves sem extensão (ver `minio.provider.ts`), por isso a
 *  extensão do URL não basta para reconhecer um PDF — `resourceType` é o que o
 *  LMS grava de facto. Sem isto, um PDF no MinIO caía no link simples em vez
 *  da pré-visualização inline. */
function isPdfResource(resource: LessonResource): boolean {
  return (resource.resourceType ?? resource.type) === "PDF" || isPdfUrl(resource.url);
}

/** O recurso que serve de corpo a uma aula de documento: um PDF (visor
 *  inline) antes de um PPTX (Office viewer), e só então o primeiro que houver. */
function pickMainDocument(resources: LessonResource[] | undefined): LessonResource | undefined {
  // O filtro antigo comparava `r.type` (campo legado) com "PDF"/"ZIP"/"LINK"
  // e só olhava para `resourceType === "DOCUMENT"` — nunca correspondia aos
  // valores que o LMS grava de facto (`enum ResourceType`: PDF, ZIP, IMAGE,
  // CODE, LINK, DOCUMENT). Resultado: um PDF anexado a uma aula de documento
  // nunca era encontrado e o ecrã dizia que a aula não tinha conteúdo.
  const docs = (resources ?? []).filter((r) => {
    const kind = r.resourceType ?? r.type;
    return Boolean(kind) && kind !== "VIDEO" && DOCUMENT_RESOURCE_TYPES.includes(kind as string);
  });
  return docs.find(isPdfResource) ?? docs.find((r) => isPptxUrl(r.url)) ?? docs[0];
}

function DocumentViewer({ lesson }: ViewerProps) {
  const main = useMemo(() => pickMainDocument(lesson.resources), [lesson.resources]);

  if (!main) {
    // Uma aula "Documento" sem ficheiro anexo ainda pode ter sido escrita como
    // texto puro (ver editor de conteúdo no admin) — nesse caso é o próprio
    // corpo da aula, não apenas uma legenda, por isso mostra-se por inteiro.
    if (lesson.description?.trim()) {
      return (
        <article className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-6">
          <header className="border-b border-border pb-3">
            <h2 className="truncate font-display text-base font-semibold tracking-tight sm:text-lg">
              {lesson.title}
            </h2>
          </header>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {lesson.description}
          </div>
        </article>
      );
    }
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Este documento ainda não possui conteúdo.
      </div>
    );
  }

  return (
    // `min-w-0`: sem isto, um conteúdo intrinsecamente largo (o antigo
    // canvas de 900px do PdfViewer, ou o iframe do PptxViewer) força a
    // coluna `1fr` da grid do player a crescer além do disponível e empurra
    // a sidebar do curso para fora do ecrã em vez de encolher com ela.
    //
    // Cabeçalho compacto de propósito — era duas linhas repetindo o mesmo
    // título (uma legenda em maiúsculas + o `<h2>`) e sobrava pouco espaço
    // para o próprio documento, que é o conteúdo que importa aqui.
    <article className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4 sm:p-6">
      <header className="space-y-0.5 border-b border-border pb-3">
        <h2 className="truncate font-display text-base font-semibold tracking-tight sm:text-lg">
          {lesson.title}
        </h2>
        {lesson.description && (
          <p className="line-clamp-1 text-xs text-muted-foreground" title={lesson.description}>
            {lesson.description}
          </p>
        )}
      </header>

      {isPdfResource(main) ? (
        <PdfViewer url={main.url} title={main.title || main.name || "Documento PDF"} />
      ) : isPptxUrl(main.url) ? (
        <PptxViewer url={main.url} title={main.title || main.name || "Apresentação"} />
      ) : (
        <ResourceLink resource={main} />
      )}
    </article>
  );
}

function PptxViewer({ url, title }: { url: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

  if (failed) {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <FileText className="size-4 text-primary" /> {title}
        </p>
        <div className="rounded-xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          <p>
            Não foi possível pré-visualizar a apresentação.{" "}
            <a href={url} target="_blank" rel="noreferrer" className="text-primary underline">
              Abrir a apresentação
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium">
          <FileText className="size-4 text-primary" /> {title}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Download className="size-4" /> Abrir
        </a>
      </div>
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted/30">
        <iframe
          src={officeUrl}
          title={title}
          className="h-full w-full"
          allowFullScreen
          onLoad={(e) => {
            // Office viewer redirects/refuses cross-origin; mark as failed if it stays blank-ish
            try {
              const win = (e.target as HTMLIFrameElement).contentWindow;
              if (win?.length === 0) setFailed(true);
            } catch {
              setFailed(true);
            }
          }}
        />
      </div>
    </div>
  );
}

function ResourceLink({ resource }: { resource: LessonResource }) {
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <FileText className="size-4 text-primary" /> {resource.title || resource.name || resource.url}
      </p>
      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Download className="size-4" /> Abrir documento
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Materiais de apoio — anexos além do conteúdo principal da aula      */
/* ------------------------------------------------------------------ */

/**
 * ID do recurso já mostrado como o próprio conteúdo da aula — espelha a
 * escolha do leitor que de facto está a ecrã, para a lista de materiais não o
 * repetir. Dependia só dos recursos, não do tipo de aula: marcava sempre o
 * vídeo *e* o documento principal como "já mostrados", e numa aula em vídeo
 * com um PDF anexo esse PDF desaparecia (nem leitor de documento, nem lista).
 */
function primaryResourceId(lesson: Lesson, type: string): string | undefined {
  if (type === "VIDEO") return resolveVideoPlayback(lesson.resources)?.video.id;
  if (type === "DOCUMENT") return pickMainDocument(lesson.resources)?.id;
  // LIVE não mostra recurso nenhum — a gravação e os anexos vão todos para a lista.
  return undefined;
}

function MaterialIcon({ resourceType }: { resourceType?: string }) {
  switch ((resourceType ?? "").toUpperCase()) {
    case "ZIP":
      return <Archive className="size-4 shrink-0 text-primary" />;
    case "LINK":
      return <LinkIcon className="size-4 shrink-0 text-primary" />;
    case "IMAGE":
      return <ImageIcon className="size-4 shrink-0 text-primary" />;
    case "CODE":
      return <Code2 className="size-4 shrink-0 text-primary" />;
    default:
      return <FileText className="size-4 shrink-0 text-primary" />;
  }
}

/**
 * Ficha de apoio, exercícios, links extra — qualquer recurso anexado à
 * aula além do vídeo/documento principal. Antes disto o `LessonViewer` só
 * lia o primeiro `resource` (o vídeo, ou o documento principal); qualquer
 * anexo a mais chegava do backend (o LMS já permite vários por aula) mas
 * nunca aparecia ao aluno — `VideoPlaceholder` já prometia "os materiais da
 * aula, se existirem, estão abaixo", sem essa lista existir de facto.
 */
const MATERIAL_ACTION_CLASS =
  "inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted";

function LessonMaterials({ lesson, type }: { lesson: Lesson; type: string }) {
  const extras = useMemo(() => {
    const primaryId = primaryResourceId(lesson, type);
    return (lesson.resources ?? []).filter((r) => r.url && !(primaryId && r.id === primaryId));
  }, [lesson, type]);
  // PDF entra num visor próprio, sem sair da página — os outros tipos ainda
  // não têm visor nenhum (ZIP, código, etc.), por isso continuam a abrir
  // num separador novo.
  const [pdfPreview, setPdfPreview] = useState<LessonResource | null>(null);

  if (extras.length === 0) return null;

  return (
    <section className="space-y-2 rounded-xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Paperclip className="size-3.5" /> Materiais de apoio
      </p>
      <ul className="divide-y divide-border">
        {extras.map((resource, i) => {
          const kind = resource.resourceType ?? resource.type;
          const isLink = kind === "LINK";
          const isPdf = isPdfResource(resource);
          return (
            <li key={resource.id || i} className="flex items-center gap-3 py-2">
              <MaterialIcon resourceType={kind} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {resource.title || resource.name || resource.url}
              </span>
              <div className="flex shrink-0 items-center gap-1.5">
                {isPdf ? (
                  <button type="button" onClick={() => setPdfPreview(resource)} className={MATERIAL_ACTION_CLASS}>
                    <ExternalLink className="size-3.5" /> Abrir
                  </button>
                ) : (
                  <a href={resource.url} target="_blank" rel="noreferrer" className={MATERIAL_ACTION_CLASS}>
                    <ExternalLink className="size-3.5" /> Abrir
                  </a>
                )}
                {/* Um link externo não é um ficheiro — nada para descarregar,
                    e o admin pode desligar a transferência por recurso
                    (`isDownloadable`; `undefined` em linhas antigas conta como
                    permitido). O `download` é só um pedido ao browser: num
                    URL de outra origem (Cloudinary/MinIO) só é respeitado se o
                    servidor mandar Content-Disposition; sem isso, abre na
                    mesma — daí "Abrir" existir sempre como alternativa. */}
                {!isLink && resource.isDownloadable !== false && (
                  <a href={resource.url} download target="_blank" rel="noreferrer" className={MATERIAL_ACTION_CLASS}>
                    <Download className="size-3.5" /> Transferir
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {pdfPreview && (
        <PdfFullscreenViewer
          url={pdfPreview.url}
          title={pdfPreview.title || pdfPreview.name || "Documento PDF"}
          onClose={() => setPdfPreview(null)}
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* LessonViewer                                                        */
/* ------------------------------------------------------------------ */

export function LessonViewer(props: ViewerProps) {
  const type = props.lesson.lessonType || props.lesson.type || "VIDEO";

  // O quiz gere o seu próprio ecrã (perguntas, submissão) — uma lista de
  // anexos por baixo não encaixa aí.
  if (type === "QUIZ") {
    return <QuizViewer lesson={props.lesson} onCompleted={props.onCompleted} />;
  }

  const main =
    type === "DOCUMENT" ? (
      <DocumentViewer {...props} />
    ) : type === "LIVE" ? (
      <LiveViewer {...props} />
    ) : (
      <VideoViewer {...props} />
    );

  return (
    <div className="space-y-4">
      {main}
      {/* Documento e aula ao vivo já trazem o título no próprio leitor; o
          vídeo não, por isso vai aqui — só a aula, sem nome do curso. */}
      {type === "VIDEO" && (
        <div className="space-y-1">
          <h1 className="font-display text-xl font-bold tracking-tight">{props.lesson.title}</h1>
          {props.lesson.description?.trim() && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {props.lesson.description}
            </p>
          )}
        </div>
      )}
      <LessonMaterials lesson={props.lesson} type={type} />
    </div>
  );
}
