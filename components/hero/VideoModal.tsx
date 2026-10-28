"use client";

import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type VideoModalProps = {
  /** Título acessível do vídeo (não aparece no ecrã) */
  titulo: string;
  /** Caminho do vídeo, por exemplo "/brand/como-inscrever.mp4" */
  src: string;
  /** Imagem mostrada antes de o vídeo arrancar */
  poster?: string;
  /** Conteúdo do botão que abre o modal */
  children: React.ReactNode;
};

export function VideoModal({ titulo, src, poster, children }: VideoModalProps) {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>

      <DialogContent className="max-w-4xl overflow-hidden border-0 bg-black p-0 sm:max-w-4xl">
        <DialogTitle className="sr-only">{titulo}</DialogTitle>

        <div className="relative aspect-video w-full bg-black">
          <video
            src={src}
            poster={poster}
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="h-full w-full"
          >
            O seu navegador não suporta a reprodução de vídeo.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Botão pronto a usar, com o ícone de Play */
export function PlayButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="group flex items-center gap-3 rounded-xl px-2 py-1 text-left transition-colors hover:bg-primary-foreground/10"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-glow transition-transform group-hover:scale-110">
        <Play className="ml-0.5 h-5 w-5 fill-current" />
      </span>
      <span className="text-sm font-semibold leading-tight text-primary-foreground">
        {label}
      </span>
    </button>
  );
}