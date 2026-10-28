"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { VimeoQuality, VimeoTextTrack } from "@vimeo/player";
import { cn } from "@/lib/utils";

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export type SettingsView = "root" | "speed" | "quality" | "captions";

export interface PlayerControlsState {
  playing: boolean;
  currentTime: number;
  duration: number;
  /** Fracção (0–1) já descarregada — o evento `progress` do Vimeo. */
  buffered: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  speedSupported: boolean;
  qualities: VimeoQuality[];
  quality: string | null;
  textTracks: VimeoTextTrack[];
  activeTrack: VimeoTextTrack | null;
  fullscreen: boolean;
  pipSupported: boolean;
  pip: boolean;
}

export interface PlayerControlsActions {
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  seekBy: (delta: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  setQuality: (id: string) => void;
  setTextTrack: (track: VimeoTextTrack | null) => void;
  toggleFullscreen: () => void;
  togglePip: () => void;
}

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = (s % 60).toString().padStart(2, "0");
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

function rateLabel(rate: number): string {
  return rate === 1 ? "Normal" : `${rate}×`;
}

function trackLabel(track: VimeoTextTrack | null): string {
  return track ? track.label || track.language : "Desligadas";
}

function qualityLabel(qualities: VimeoQuality[], id: string | null): string {
  if (!id || id === "auto") return "Auto";
  return qualities.find((q) => q.id === id)?.label ?? id;
}

/* ------------------------------------------------------------------ */

const ICON_BUTTON =
  "grid size-9 shrink-0 place-items-center rounded-md text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 cursor-pointer";

/**
 * Barra de progresso própria — o `<input type="range">` não sabe mostrar a
 * parte já descarregada nem o tempo sob o cursor. Arrasta-se com pointer
 * events (rato e toque) e responde a setas/Home/End como qualquer slider.
 * Enquanto se arrasta mostra a posição pretendida, mas só pede o salto ao
 * Vimeo ao largar — cada `setCurrentTime` é um postMessage e um pedido de
 * vídeo, não convém disparar um por cada pixel.
 */
function SeekBar({
  currentTime,
  duration,
  buffered,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  buffered: number;
  onSeek: (seconds: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const [hover, setHover] = useState<{ x: number; time: number } | null>(null);

  const timeAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || !duration) return { x: 0, time: 0 };
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    return { x, time: (x / rect.width) * duration };
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!duration || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setScrubTime(timeAt(e.clientX).time);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const at = timeAt(e.clientX);
    if (e.pointerType === "mouse") setHover(at);
    if (scrubTime !== null) setScrubTime(at.time);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (scrubTime === null) return;
    onSeek(timeAt(e.clientX).time);
    setScrubTime(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target =
      e.key === "ArrowLeft" ? currentTime - 5
      : e.key === "ArrowRight" ? currentTime + 5
      : e.key === "Home" ? 0
      : e.key === "End" ? duration
      : null;
    if (target === null) return;
    // As setas do slider movem 5s; sem isto, o atalho global do player
    // (±10s) também corria e o salto era a dobrar.
    e.preventDefault();
    e.stopPropagation();
    onSeek(Math.min(Math.max(target, 0), duration));
  };

  const shown = scrubTime ?? currentTime;
  const played = duration ? (shown / duration) * 100 : 0;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Progresso do vídeo"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(shown)}
      aria-valuetext={`${formatTime(shown)} de ${formatTime(duration)}`}
      className="group/seek relative flex h-4 cursor-pointer touch-none items-center focus-visible:outline-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setScrubTime(null)}
      onPointerLeave={() => setHover(null)}
      onKeyDown={onKeyDown}
    >
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25 transition-[height] group-hover/seek:h-1.5 group-focus-visible/seek:h-1.5">
        <div className="absolute inset-y-0 left-0 bg-white/35" style={{ width: `${buffered * 100}%` }} />
        <div className="absolute inset-y-0 left-0 bg-gradient-primary" style={{ width: `${played}%` }} />
      </div>
      <div
        className={cn(
          "pointer-events-none absolute size-3.5 -translate-x-1/2 rounded-full bg-white shadow ring-2 ring-primary transition-transform",
          scrubTime === null && "scale-0 group-hover/seek:scale-100 group-focus-visible/seek:scale-100",
        )}
        style={{ left: `${played}%` }}
      />
      {hover && scrubTime === null && (
        <span
          className="pointer-events-none absolute bottom-5 -translate-x-1/2 rounded bg-black/85 px-1.5 py-0.5 text-xs font-medium tabular-nums text-white"
          style={{ left: hover.x }}
        >
          {formatTime(hover.time)}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MenuItem({
  children,
  value,
  onClick,
  selected,
}: {
  children: ReactNode;
  value?: string;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      role={selected === undefined ? "menuitem" : "menuitemradio"}
      aria-checked={selected}
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:outline-none"
    >
      {selected !== undefined && (
        <Check className={cn("size-4 shrink-0 text-primary-glow", !selected && "invisible")} />
      )}
      <span className="flex-1">{children}</span>
      {value !== undefined && (
        <>
          <span className="text-white/60">{value}</span>
          <ChevronRight className="size-4 text-white/60" />
        </>
      )}
    </button>
  );
}

/**
 * Velocidade, qualidade e legendas num único menu (como no YouTube) — três
 * botões soltos não cabiam na barra em largura de telemóvel. Fica dentro do
 * próprio player, sem portal: um portal vai para o `<body>`, que está fora
 * do elemento em ecrã inteiro, e o menu deixava de se ver.
 */
function SettingsMenu({
  view,
  onViewChange,
  state,
  actions,
}: {
  view: SettingsView;
  onViewChange: (view: SettingsView | null) => void;
  state: PlayerControlsState;
  actions: PlayerControlsActions;
}) {
  const back = (
    <button
      type="button"
      onClick={() => onViewChange("root")}
      className="mb-1 flex w-full cursor-pointer items-center gap-1 border-b border-white/10 px-2 pb-2 text-sm font-semibold text-white"
    >
      <ChevronLeft className="size-4" />
      {view === "speed" ? "Velocidade" : view === "quality" ? "Qualidade" : "Legendas"}
    </button>
  );

  return (
    <div
      role="menu"
      aria-label="Definições do vídeo"
      className="absolute right-2 bottom-14 z-30 max-h-[70%] w-56 overflow-y-auto rounded-lg border border-white/10 bg-black/90 p-1.5 shadow-xl backdrop-blur"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {view === "root" && (
        <>
          {state.speedSupported && (
            <MenuItem value={rateLabel(state.playbackRate)} onClick={() => onViewChange("speed")}>
              Velocidade
            </MenuItem>
          )}
          {state.qualities.length > 1 && (
            <MenuItem value={qualityLabel(state.qualities, state.quality)} onClick={() => onViewChange("quality")}>
              Qualidade
            </MenuItem>
          )}
          {state.textTracks.length > 0 && (
            <MenuItem value={trackLabel(state.activeTrack)} onClick={() => onViewChange("captions")}>
              Legendas
            </MenuItem>
          )}
        </>
      )}

      {view === "speed" && (
        <>
          {back}
          {PLAYBACK_RATES.map((rate) => (
            <MenuItem
              key={rate}
              selected={state.playbackRate === rate}
              onClick={() => {
                actions.setPlaybackRate(rate);
                onViewChange(null);
              }}
            >
              {rateLabel(rate)}
            </MenuItem>
          ))}
        </>
      )}

      {view === "quality" && (
        <>
          {back}
          {state.qualities.map((q) => (
            <MenuItem
              key={q.id}
              selected={(state.quality ?? "auto") === q.id}
              onClick={() => {
                actions.setQuality(q.id);
                onViewChange(null);
              }}
            >
              {q.id === "auto" ? "Auto" : q.label}
            </MenuItem>
          ))}
        </>
      )}

      {view === "captions" && (
        <>
          {back}
          <MenuItem
            selected={state.activeTrack === null}
            onClick={() => {
              actions.setTextTrack(null);
              onViewChange(null);
            }}
          >
            Desligadas
          </MenuItem>
          {state.textTracks.map((track) => (
            <MenuItem
              key={`${track.language}-${track.kind}`}
              selected={
                state.activeTrack?.language === track.language && state.activeTrack?.kind === track.kind
              }
              onClick={() => {
                actions.setTextTrack(track);
                onViewChange(null);
              }}
            >
              {trackLabel(track)}
            </MenuItem>
          ))}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function PlayerControls({
  state,
  actions,
  visible,
  settingsView,
  onSettingsViewChange,
  onHoverChange,
}: {
  state: PlayerControlsState;
  actions: PlayerControlsActions;
  visible: boolean;
  settingsView: SettingsView | null;
  onSettingsViewChange: (view: SettingsView | null) => void;
  onHoverChange: (hovering: boolean) => void;
}) {
  const VolumeIcon = state.muted || state.volume === 0 ? VolumeX : state.volume < 0.5 ? Volume1 : Volume2;
  const hasSettings = state.speedSupported || state.qualities.length > 1 || state.textTracks.length > 0;

  return (
    <>
      {settingsView && (
        <SettingsMenu
          view={settingsView}
          onViewChange={onSettingsViewChange}
          state={state}
          actions={actions}
        />
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/85 via-black/45 to-transparent px-2 pt-10 pb-1.5 transition-opacity duration-200 sm:px-3",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        // Um clique na barra não pode chegar à superfície por baixo, que
        // alterna play/pausa.
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onPointerEnter={(e) => e.pointerType === "mouse" && onHoverChange(true)}
        onPointerLeave={() => onHoverChange(false)}
      >
        <SeekBar
          currentTime={state.currentTime}
          duration={state.duration}
          buffered={state.buffered}
          onSeek={actions.seekTo}
        />

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            className={ICON_BUTTON}
            onClick={actions.togglePlay}
            aria-label={state.playing ? "Pausar (k)" : "Reproduzir (k)"}
            title={state.playing ? "Pausar (k)" : "Reproduzir (k)"}
          >
            {state.playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
          </button>
          <button
            type="button"
            className={cn(ICON_BUTTON, "hidden sm:grid")}
            onClick={() => actions.seekBy(-10)}
            aria-label="Recuar 10 segundos"
            title="Recuar 10 segundos (←)"
          >
            <RotateCcw className="size-[18px]" />
          </button>
          <button
            type="button"
            className={cn(ICON_BUTTON, "hidden sm:grid")}
            onClick={() => actions.seekBy(10)}
            aria-label="Avançar 10 segundos"
            title="Avançar 10 segundos (→)"
          >
            <RotateCw className="size-[18px]" />
          </button>

          <div className="group/volume flex items-center">
            <button
              type="button"
              className={ICON_BUTTON}
              onClick={actions.toggleMute}
              aria-label={state.muted ? "Ligar som (m)" : "Silenciar (m)"}
              title={state.muted ? "Ligar som (m)" : "Silenciar (m)"}
            >
              <VolumeIcon className="size-5" />
            </button>
            {/* Em telemóvel o volume é o dos botões do aparelho — só o mudo
                faz sentido; no desktop o slider abre ao passar o rato. */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={state.muted ? 0 : state.volume}
              onChange={(e) => actions.setVolume(Number(e.target.value))}
              onKeyDown={(e) => e.stopPropagation()}
              aria-label="Volume"
              className="hidden h-1 w-0 cursor-pointer accent-primary-glow opacity-0 transition-all duration-200 group-focus-within/volume:w-20 group-focus-within/volume:opacity-100 group-hover/volume:w-20 group-hover/volume:opacity-100 sm:block"
            />
          </div>

          <span className="ml-1.5 text-xs font-medium tabular-nums text-white/90 sm:text-sm">
            {formatTime(state.currentTime)}
            <span className="text-white/50"> / {formatTime(state.duration)}</span>
          </span>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            {hasSettings && (
              <button
                type="button"
                className={cn(ICON_BUTTON, settingsView && "bg-white/15")}
                onClick={() => onSettingsViewChange(settingsView ? null : "root")}
                aria-label="Definições"
                aria-haspopup="menu"
                aria-expanded={Boolean(settingsView)}
                title="Definições"
              >
                <Settings className={cn("size-5 transition-transform", settingsView && "rotate-45")} />
              </button>
            )}
            {state.pipSupported && (
              <button
                type="button"
                className={cn(ICON_BUTTON, "hidden sm:grid")}
                onClick={actions.togglePip}
                aria-label={state.pip ? "Sair da imagem na imagem" : "Imagem na imagem"}
                title={state.pip ? "Sair da imagem na imagem" : "Imagem na imagem"}
              >
                <PictureInPicture2 className="size-5" />
              </button>
            )}
            <button
              type="button"
              className={ICON_BUTTON}
              onClick={actions.toggleFullscreen}
              aria-label={state.fullscreen ? "Sair do ecrã inteiro (f)" : "Ecrã inteiro (f)"}
              title={state.fullscreen ? "Sair do ecrã inteiro (f)" : "Ecrã inteiro (f)"}
            >
              {state.fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
