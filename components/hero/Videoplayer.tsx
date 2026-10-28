"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";

type VideoPlayerProps = {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  title?: string;
};

function formatarTempo(segundos: number) {
  if (!Number.isFinite(segundos) || segundos < 0) return "0:00";
  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60).toString().padStart(2, "0");
  return `${minutos}:${resto}`;
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  title = "Vídeo",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [aReproduzir, setAReproduzir] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [duracao, setDuracao] = useState(0);
  const [tempoAtual, setTempoAtual] = useState(0);

  const alternarReproducao = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  const alternarMudo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMudo(video.muted);
  };

  const procurar = (e: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const novoTempo = Number(e.target.value);
    video.currentTime = novoTempo;
    setTempoAtual(novoTempo);
  };

  const ecraInteiro = () => {
    void videoRef.current?.requestFullscreen?.();
  };

  const progresso = duracao ? (tempoAtual / duracao) * 100 : 0;

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        aria-label={title}
        className="h-full w-full object-contain"
        onPlay={() => setAReproduzir(true)}
        onPause={() => setAReproduzir(false)}
        onEnded={() => setAReproduzir(false)}
        onLoadedMetadata={(e) => setDuracao(e.currentTarget.duration)}
        onTimeUpdate={(e) => setTempoAtual(e.currentTarget.currentTime)}
        onClick={alternarReproducao}
      />

      {/* Botão central quando está em pausa */}
      {!aReproduzir && (
        <button
          type="button"
          onClick={alternarReproducao}
          aria-label="Reproduzir vídeo"
          className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-glow transition-transform hover:scale-105"
        >
          <Play className="ml-1 h-7 w-7 fill-current" />
        </button>
      )}

      {/* Barra de controlo */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/85 to-transparent px-4 pb-3 pt-12 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
        <input
          type="range"
          min={0}
          max={duracao || 0}
          step={0.1}
          value={tempoAtual}
          onChange={procurar}
          aria-label="Progresso do vídeo"
          className="h-1.5 w-full cursor-pointer accent-secondary"
          style={{
            background: `linear-gradient(to right, var(--secondary) ${progresso}%, rgba(255,255,255,0.3) ${progresso}%)`,
          }}
        />

        <div className="flex items-center gap-3 text-white">
          <button
            type="button"
            onClick={alternarReproducao}
            aria-label={aReproduzir ? "Pausar" : "Reproduzir"}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15"
          >
            {aReproduzir ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={alternarMudo}
            aria-label={mudo ? "Ativar som" : "Silenciar"}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15"
          >
            {mudo ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          <span className="text-xs tabular-nums text-white/90">
            {formatarTempo(tempoAtual)} / {formatarTempo(duracao)}
          </span>

          <button
            type="button"
            onClick={ecraInteiro}
            aria-label="Ecrã inteiro"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}