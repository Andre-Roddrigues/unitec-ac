"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import type Player from "@vimeo/player";
import type { VimeoTextTrack } from "@vimeo/player";
import { CircleAlert, CircleCheck, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import {
  PlayerControls,
  type PlayerControlsActions,
  type PlayerControlsState,
  type SettingsView,
} from "@/components/video/player-controls";
import { cn } from "@/lib/utils";

/** Controlos escondem-se ao fim disto parados enquanto o vídeo toca. */
const CONTROLS_IDLE_MS = 2500;
const SEEK_STEP_SECONDS = 10;
const VOLUME_STEP = 0.1;
/** Mesmo limiar do leitor antigo — quem fecha durante os créditos já viu a aula. */
const COMPLETION_PERCENT = 0.96;
/** Não retoma nos últimos segundos — reabrir uma aula já vista não pode cair no fim. */
const RESUME_TAIL_SECONDS = 5;
/** Erros do Vimeo que querem dizer "este vídeo não toca aqui", não um método que falhou. */
const FATAL_ERRORS = new Set(["PrivacyError", "NotFoundError", "PasswordError"]);

const INITIAL_STATE: PlayerControlsState = {
  playing: false,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  volume: 1,
  muted: false,
  playbackRate: 1,
  speedSupported: true,
  qualities: [],
  quality: null,
  textTracks: [],
  activeTrack: null,
  fullscreen: false,
  pipSupported: false,
  pip: false,
};

/**
 * `controls=0` tira tudo o que é do Vimeo (logo, título, autor, partilha,
 * barra, ecrã final de "mais vídeos") — só funciona em conta paga, e a da
 * Unitec é Starter. `speed=1` e `pip=1` não mostram nada com `controls=0`,
 * mas são o que liga `setPlaybackRate` e `requestPictureInPicture` na API.
 */
function buildEmbedUrl(vimeoId: string, vimeoHash: string | null | undefined, autoplay: boolean): string {
  const params = new URLSearchParams({
    controls: "0",
    vimeo_logo: "0",
    title: "0",
    byline: "0",
    portrait: "0",
    badge: "0",
    dnt: "1",
    autopause: "0",
    playsinline: "1",
    speed: "1",
    pip: "1",
    keyboard: "0",
    transparent: "0",
    autoplay: autoplay ? "1" : "0",
  });
  // Obrigatório para vídeos ocultos (`privacy.view=disable`) — sem ele o
  // embed dá erro de permissão.
  if (vimeoHash) params.set("h", vimeoHash);
  return `https://player.vimeo.com/video/${vimeoId}?${params.toString()}`;
}

export interface VimeoPlayerProps {
  vimeoId: string;
  vimeoHash?: string | null;
  /** Título da aula/curso — dá nome ao iframe e aparece em ecrã inteiro. */
  title: string;
  autoplay?: boolean;
  /** `lesson` mostra "Aula concluída" no fim; `trailer` só oferece ver de novo. */
  kind?: "lesson" | "trailer";
  /** De onde retomar (`LessonProgress.watchedDuration`). */
  initialPositionSeconds?: number;
  onCompleted?: () => void;
  /** Aula seguinte, para o botão do ecrã final — ausente na última aula e fora do curso. */
  next?: { title: string; onSelect: () => void };
  className?: string;
}

/**
 * Vídeo do Vimeo com a cara da Unitec: o iframe corre sem interface nenhuma
 * do Vimeo e por cima vai uma camada própria (controlos, logo, ecrã final),
 * ligada pelo SDK oficial. Uma película transparente cobre o
 * iframe e apanha todos os cliques, por isso o aluno nunca chega a interagir
 * com o Vimeo — nem com o menu de contexto dele, nem com links para o site.
 *
 * O iframe é criado à mão dentro de `hostRef` em vez de vir do JSX: o
 * `destroy()` do SDK tira-o do DOM, e se fosse um nó do React isso partia a
 * reconciliação (e o duplo mount do StrictMode em dev). Quem usa isto deve
 * passar `key={vimeoId}` para recomeçar o estado a cada vídeo.
 */
export function VimeoPlayer({
  vimeoId,
  vimeoHash,
  title,
  autoplay = false,
  kind = "lesson",
  initialPositionSeconds,
  onCompleted,
  next,
  className,
}: VimeoPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const completedRef = useRef(false);
  // Intenção mais recente de play/pausa — o estado só chega pelo evento do
  // Vimeo, e dois toques seguidos (duplo clique) liam o mesmo valor velho.
  const playingRef = useRef(false);
  // Salto pedido e ainda não feito — os `timeupdate` que chegam entretanto
  // são da posição antiga e puxavam a barra para trás.
  const seekingRef = useRef(false);
  const idleTimerRef = useRef<number | undefined>(undefined);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [ended, setEnded] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [idle, setIdle] = useState(false);
  const [touchUi, setTouchUi] = useState(false);
  const [settingsView, setSettingsView] = useState<SettingsView | null>(null);
  // Rato pousado na barra — não se escondem os controlos debaixo dele.
  const [overControls, setOverControls] = useState(false);
  const [state, setState] = useState<PlayerControlsState>(INITIAL_STATE);

  const patch = useCallback((changes: Partial<PlayerControlsState>) => {
    setState((prev) => ({ ...prev, ...changes }));
  }, []);

  const poke = useCallback(() => {
    setIdle(false);
    window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => setIdle(true), CONTROLS_IDLE_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(idleTimerRef.current), []);

  /* --- eventos do Vimeo ------------------------------------------- */

  const markCompleted = useEffectEvent(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleted?.();
  });

  const handleReady = useEffectEvent(async (player: Player) => {
    const [duration, volume, muted, playbackRate, qualities, quality, textTracks] = await Promise.all([
      player.getDuration(),
      player.getVolume(),
      player.getMuted(),
      player.getPlaybackRate().catch(() => 1),
      player.getQualities().catch(() => []),
      player.getQuality().catch(() => null),
      player.getTextTracks().catch(() => [] as VimeoTextTrack[]),
    ]);
    if (playerRef.current !== player) return;

    patch({
      duration,
      volume,
      muted,
      playbackRate,
      qualities,
      quality,
      textTracks,
      pipSupported: document.pictureInPictureEnabled === true,
    });
    setStatus("ready");

    if (
      initialPositionSeconds &&
      initialPositionSeconds > 0 &&
      initialPositionSeconds < duration - RESUME_TAIL_SECONDS
    ) {
      // Antes do play o Vimeo não emite `timeupdate` (e o salto só se conclui
      // quando começa a tocar) — sem o patch, a barra e o ±10s, que parte de
      // `currentTime`, ficavam no 0.
      seekingRef.current = true;
      patch({ currentTime: initialPositionSeconds });
      player
        .setCurrentTime(initialPositionSeconds)
        .catch(() => undefined)
        .finally(() => {
          seekingRef.current = false;
        });
    }
  });

  const handlePlay = useEffectEvent(() => {
    playingRef.current = true;
    patch({ playing: true });
    setEnded(false);
    poke();
  });

  const handlePause = useEffectEvent(() => {
    playingRef.current = false;
    patch({ playing: false });
    setBuffering(false);
  });

  const handleEnded = useEffectEvent(() => {
    playingRef.current = false;
    patch({ playing: false });
    setBuffering(false);
    setSettingsView(null);
    setEnded(true);
    markCompleted();
  });

  const handleTimeUpdate = useEffectEvent((seconds: number, duration: number, percent: number) => {
    patch(seekingRef.current ? { duration } : { currentTime: seconds, duration });
    if (percent >= COMPLETION_PERCENT) markCompleted();
  });

  const handleError = useEffectEvent((name: string) => {
    if (status !== "ready" && FATAL_ERRORS.has(name)) setStatus("error");
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const iframe = document.createElement("iframe");
    iframe.src = buildEmbedUrl(vimeoId, vimeoHash, autoplay);
    iframe.title = `${title} — vídeo`;
    iframe.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
    iframe.className = "absolute inset-0 size-full";
    // O foco fica no wrapper (atalhos de teclado), nunca dentro do Vimeo.
    iframe.tabIndex = -1;
    host.appendChild(iframe);

    let disposed = false;
    let player: Player | null = null;

    import("@vimeo/player")
      .then(({ default: VimeoSdk }) => {
        if (disposed) return;
        const p = new VimeoSdk(iframe);
        player = p;
        playerRef.current = p;

        p.ready()
          .then(() => (disposed ? undefined : handleReady(p)))
          .catch(() => {
            if (!disposed) setStatus("error");
          });
        p.on("play", () => handlePlay());
        p.on("pause", () => handlePause());
        p.on("ended", () => handleEnded());
        p.on("timeupdate", (d) => handleTimeUpdate(d.seconds, d.duration, d.percent));
        p.on("seeked", (d) => {
          seekingRef.current = false;
          patch({ currentTime: d.seconds });
        });
        p.on("progress", (d) => patch({ buffered: d.percent }));
        p.on("bufferstart", () => setBuffering(true));
        p.on("bufferend", () => setBuffering(false));
        p.on("volumechange", (d) => patch({ volume: d.volume, muted: d.muted }));
        p.on("playbackratechange", (d) => patch({ playbackRate: d.playbackRate }));
        p.on("qualitychange", (d) => patch({ quality: d.quality }));
        p.on("enterpictureinpicture", () => patch({ pip: true }));
        p.on("leavepictureinpicture", () => patch({ pip: false }));
        // Só o ecrã inteiro nativo do iOS (ver `toggleFullscreen`) passa por
        // aqui — o do wrapper é apanhado pelo `fullscreenchange` do documento.
        p.on("fullscreenchange", (d) => patch({ fullscreen: d.fullscreen }));
        p.on("error", (d) => handleError(d.name));
      })
      .catch(() => {
        if (!disposed) setStatus("error");
      });

    return () => {
      disposed = true;
      playerRef.current = null;
      if (player) {
        player.destroy().catch(() => undefined);
      } else {
        iframe.remove();
      }
    };
  }, [vimeoId, vimeoHash, autoplay, title, patch]);

  useEffect(() => {
    const onChange = () => patch({ fullscreen: document.fullscreenElement === wrapperRef.current });
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [patch]);

  /* --- acções ------------------------------------------------------ */

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (playingRef.current) {
      playingRef.current = false;
      player.pause().catch(() => undefined);
      return;
    }
    playingRef.current = true;
    player.play().catch(() => {
      playingRef.current = false;
      patch({ playing: false });
    });
  };

  const seekTo = (seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    const target = Math.min(Math.max(seconds, 0), state.duration || seconds);
    setEnded(false);
    patch({ currentTime: target });
    seekingRef.current = true;
    player
      .setCurrentTime(target)
      .catch(() => undefined)
      .finally(() => {
        seekingRef.current = false;
      });
  };

  const setVolume = (volume: number) => {
    const player = playerRef.current;
    if (!player) return;
    const v = Math.min(Math.max(volume, 0), 1);
    patch({ volume: v, muted: v === 0 });
    player.setVolume(v).catch(() => undefined);
    if (v > 0 && state.muted) player.setMuted(false).catch(() => undefined);
  };

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    const muted = !state.muted;
    patch({ muted });
    player.setMuted(muted).catch(() => undefined);
    // Tirar o mudo com o volume a zero deixava-o calado na mesma.
    if (!muted && state.volume === 0) setVolume(0.5);
  };

  const setTextTrack = (track: VimeoTextTrack | null) => {
    const player = playerRef.current;
    if (!player) return;
    if (!track) {
      player.disableTextTrack().catch(() => undefined);
      patch({ activeTrack: null });
      return;
    }
    // A legenda é o próprio Vimeo que a desenha. Tentou-se desenhá-la nós (a
    // partir do `cuechange`, com `showing=false`), mas o Vimeo desenhava a
    // dele na mesma e ficavam duas sobrepostas.
    player
      .enableTextTrack(track.language, track.kind)
      .then(() => patch({ activeTrack: track }))
      .catch(() => undefined);
  };

  const toggleFullscreen = () => {
    const wrapper = wrapperRef.current;
    const player = playerRef.current;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
      return;
    }
    if (state.fullscreen) {
      player?.exitFullscreen().catch(() => undefined);
      return;
    }
    // O wrapper inteiro vai para ecrã inteiro, para os controlos e o logo
    // irem com ele. O iPhone não deixa pôr elementos em ecrã inteiro — aí
    // cai no ecrã inteiro nativo do vídeo (sem marca do Vimeo, mas também
    // sem os nossos controlos).
    if (wrapper && document.fullscreenEnabled) {
      wrapper.requestFullscreen().catch(() => player?.requestFullscreen().catch(() => undefined));
    } else {
      player?.requestFullscreen().catch(() => undefined);
    }
  };

  const actions: PlayerControlsActions = {
    togglePlay,
    seekTo,
    seekBy: (delta) => seekTo(state.currentTime + delta),
    setVolume,
    toggleMute,
    setPlaybackRate: (rate) => {
      playerRef.current
        ?.setPlaybackRate(rate)
        .then(() => patch({ playbackRate: rate }))
        .catch(() => patch({ speedSupported: false }));
    },
    setQuality: (id) => {
      playerRef.current
        ?.setQuality(id)
        .then(() => patch({ quality: id }))
        .catch(() => undefined);
    },
    setTextTrack,
    toggleFullscreen,
    togglePip: () => {
      const player = playerRef.current;
      if (!player) return;
      if (state.pip) {
        player.exitPictureInPicture().catch(() => undefined);
        return;
      }
      player.requestPictureInPicture().catch(() => patch({ pipSupported: false }));
    },
  };

  const replay = () => {
    const player = playerRef.current;
    if (!player) return;
    setEnded(false);
    player
      .setCurrentTime(0)
      .then(() => player.play())
      .catch(() => undefined);
  };

  /* --- interacção -------------------------------------------------- */

  const controlsVisible =
    status === "ready" && !ended && (!state.playing || !idle || settingsView !== null || overControls);

  const handleSurfaceClick = () => {
    if (settingsView) {
      setSettingsView(null);
      return;
    }
    // No toque, um toque mostra/esconde os controlos (como nas apps nativas);
    // play/pausa fica no botão central.
    if (touchUi) {
      if (controlsVisible && state.playing) {
        window.clearTimeout(idleTimerRef.current);
        setIdle(true);
      } else {
        poke();
      }
      return;
    }
    togglePlay();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (status !== "ready" || ended || e.metaKey || e.ctrlKey || e.altKey) return;
    const onButton = e.target !== e.currentTarget && (e.target as HTMLElement).closest("button");

    switch (e.key) {
      case " ":
      case "Enter":
        // Num botão focado, espaço/enter carregam o próprio botão.
        if (onButton) return;
        togglePlay();
        break;
      case "k":
      case "K":
        togglePlay();
        break;
      case "ArrowLeft":
      case "j":
      case "J":
        actions.seekBy(-SEEK_STEP_SECONDS);
        break;
      case "ArrowRight":
      case "l":
      case "L":
        actions.seekBy(SEEK_STEP_SECONDS);
        break;
      case "ArrowUp":
        setVolume((state.muted ? 0 : state.volume) + VOLUME_STEP);
        break;
      case "ArrowDown":
        setVolume((state.muted ? 0 : state.volume) - VOLUME_STEP);
        break;
      case "m":
      case "M":
        toggleMute();
        break;
      case "f":
      case "F":
        toggleFullscreen();
        break;
      case "c":
      case "C":
        if (state.textTracks.length === 0) return;
        setTextTrack(state.activeTrack ? null : state.textTracks[0]);
        break;
      case "Escape":
        if (!settingsView) return;
        setSettingsView(null);
        break;
      default:
        return;
    }
    e.preventDefault();
    poke();
  };

  const showCenterButton =
    status === "ready" && !ended && !buffering && (!state.playing || (touchUi && controlsVisible));

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      role="region"
      aria-label={`Leitor de vídeo: ${title}`}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => setTouchUi(e.pointerType === "touch")}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") poke();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse" && state.playing && !settingsView) setIdle(true);
      }}
      className={cn(
        "relative aspect-video w-full overflow-hidden bg-black outline-none select-none focus-visible:ring-2 focus-visible:ring-ring [&:fullscreen]:rounded-none [&:fullscreen]:border-0",
        state.fullscreen && !controlsVisible && "cursor-none",
        className,
      )}
    >
      {/* O iframe é injectado aqui por código — ver nota do componente. */}
      <div ref={hostRef} className="absolute inset-0" />

      {/* Película por cima do iframe: todos os cliques são nossos. */}
      <div
        className="absolute inset-0 z-10"
        onClick={handleSurfaceClick}
        onDoubleClick={() => {
          if (!touchUi) toggleFullscreen();
        }}
      />

      <Image
        src="/brand/ICON_ACADEMY.png"
        alt=""
        aria-hidden
        width={40}
        height={40}
        className="pointer-events-none absolute top-3 right-3 z-20 size-7 opacity-80 drop-shadow-md sm:size-9"
      />

      {state.fullscreen && controlsVisible && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-linear-to-b from-black/75 to-transparent px-5 pt-4 pb-10">
          <p className="truncate pr-14 font-display text-lg font-semibold text-white">{title}</p>
        </div>
      )}

      {(status === "loading" || (buffering && state.playing)) && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
          {/* Mesmo com `controls=0` o Vimeo desenha o seu círculo de
              carregamento ao centro (~115px) — o disco tapa-o. */}
          <span className="grid size-32 place-items-center rounded-full bg-black ring-1 ring-white/10">
            <span className="size-12 animate-spin rounded-full border-4 border-white/15 border-t-primary-glow" />
          </span>
        </div>
      )}

      {showCenterButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          aria-label={state.playing ? "Pausar" : "Reproduzir"}
          className="absolute top-1/2 left-1/2 z-20 grid size-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-glow transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:size-20"
        >
          {state.playing ? (
            <Pause className="size-7 fill-current sm:size-8" />
          ) : (
            <Play className="ml-1 size-7 fill-current sm:size-8" />
          )}
        </button>
      )}

      {status === "ready" && (
        <PlayerControls
          state={state}
          actions={actions}
          visible={controlsVisible}
          settingsView={settingsView}
          onSettingsViewChange={setSettingsView}
          onHoverChange={setOverControls}
        />
      )}

      {ended && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/85 p-4 text-center text-white backdrop-blur-sm">
          <div className="max-w-sm space-y-4">
            {kind === "lesson" && (
              <div className="space-y-2">
                <CircleCheck className="mx-auto size-10 text-success sm:size-12" />
                <p className="font-display text-lg font-bold sm:text-xl">Aula concluída</p>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={replay}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <RotateCcw className="size-4" />
                {next ? "Rever" : "Ver de novo"}
              </button>
              {next && (
                <button
                  type="button"
                  onClick={next.onSelect}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  Próxima aula
                  <SkipForward className="size-4 fill-current" />
                </button>
              )}
            </div>
            {next && <p className="line-clamp-2 text-sm text-white/70">A seguir: {next.title}</p>}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black p-6 text-center text-white">
          <div className="max-w-sm space-y-2">
            <CircleAlert className="mx-auto size-9 text-white/70" />
            <p className="font-semibold">Não foi possível carregar o vídeo</p>
            <p className="text-sm text-white/70">
              Verifique a ligação e tente recarregar a página. Se o problema continuar, contacte o suporte.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
