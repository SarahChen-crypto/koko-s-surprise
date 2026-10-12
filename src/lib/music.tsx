import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Music2, Pause, Play } from 'lucide-react';

const SONG_ID = 'GH-2rEDXWOI';
const SONG_LABEL = 'Star · Colde';
const VOLUME = 45;

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (value: number) => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getPlayerState: () => number;
  destroy: () => void;
};

type YTNamespace = {
  Player: new (element: HTMLElement, options: Record<string, unknown>) => YTPlayer;
  PlayerState: { PLAYING: number; ENDED: number };
};

type YTWindow = Window & { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void };

type MusicApi = { playing: boolean; ready: boolean; toggle: () => void };

const MusicContext = createContext<MusicApi>({ playing: false, ready: false, toggle: () => {} });

export function useGiftMusic() {
  return useContext(MusicContext);
}

function loadYouTubeApi(): Promise<YTNamespace | null> {
  const w = window as YTWindow;
  if (w.YT?.Player) return Promise.resolve(w.YT);
  return new Promise(resolve => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(w.YT ?? null);
    };
    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
      finish();
    };
    if (!document.querySelector('script[data-youtube-iframe-api]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.youtubeIframeApi = '1';
      script.onerror = finish;
      document.head.appendChild(script);
    }
    window.setTimeout(finish, 8000);
  });
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);

  useEffect(() => {
    let disposed = false;
    let unlocked = false;
    let player: YTPlayer | null = null;

    const shell = document.createElement('div');
    shell.className = 'gift-music-frame';
    shell.setAttribute('aria-hidden', 'true');
    const mount = document.createElement('div');
    shell.appendChild(mount);
    document.body.appendChild(shell);

    const stopListening = () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    // Browsers only allow sound after the visitor touches the page, so the song
    // starts muted and the very first tap or key press lets the audio through.
    function unlock() {
      if (unlocked || !player) return;
      unlocked = true;
      stopListening();
      try {
        player.unMute();
        player.setVolume(VOLUME);
        player.playVideo();
      } catch {
        /* the player is not listening yet */
      }
    }

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);

    void loadYouTubeApi().then(YT => {
      if (!YT || disposed) return;
      player = new YT.Player(mount, {
        videoId: SONG_ID,
        width: '240',
        height: '150',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          loop: 1,
          playlist: SONG_ID,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            playerRef.current = player;
            setReady(true);
            try {
              player?.mute();
              player?.setVolume(VOLUME);
              player?.playVideo();
            } catch {
              /* autoplay still blocked; the gesture listener covers it */
            }
          },
          onStateChange: (event: { data: number }) => {
            setPlaying(event.data === YT.PlayerState.PLAYING);
            if (event.data === YT.PlayerState.ENDED) {
              try {
                player?.seekTo(0, true);
                player?.playVideo();
              } catch {
                /* ignore */
              }
            }
          },
        },
      });
    });

    return () => {
      disposed = true;
      stopListening();
      try {
        player?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
      shell.remove();
    };
  }, []);

  const toggle = () => {
    const player = playerRef.current;
    if (!player) return;
    unlocked = true;
    stopListening();
    try {
      if (playing) player.pauseVideo();
      else {
        player.unMute();
        player.setVolume(VOLUME);
        player.playVideo();
      }
    } catch {
      /* ignore */
    }
  };

  return <MusicContext.Provider value={{ playing, ready, toggle }}>{children}</MusicContext.Provider>;
}

export function MusicToggle() {
  const { playing, ready, toggle } = useGiftMusic();
  return (
    <button
      type="button"
      className={`music-toggle${playing ? ' is-playing' : ''}`}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? `Pause background music, ${SONG_LABEL}` : `Play background music, ${SONG_LABEL}`}
      title={ready ? SONG_LABEL : `${SONG_LABEL} · getting it ready`}
    >
      {playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
      <Music2 size={15} />
      <span>{SONG_LABEL}</span>
    </button>
  );
}
