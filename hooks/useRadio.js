import { useEffect, useState } from 'react';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio';

const STREAM_URL = 'https://miestacion.turadioonline.com.ar:7115/stream';
const STATS_URL =
  'https://miestacion.turadioonline.com.ar:7115/stats?sid=1&json=1';

export const PlayerState = {
  Playing: 'playing',
  Paused: 'paused',
  Buffering: 'buffering',
  None: 'none',
};

export const useRadio = () => {
  const [isSetup, setIsSetup] = useState(false);
  const player = useAudioPlayer(STREAM_URL);
  const status = useAudioPlayerStatus(player);

  const [trackTitle, setTrackTitle] = useState('Estamos al aire');
  const [trackArtist, setTrackArtist] = useState('En Vivo');
  const [isLive, setIsLive] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);

  const isPlaying = Boolean(status?.playing || status?.isBuffering);
  const playerState = status?.isBuffering
    ? PlayerState.Buffering
    : status?.playing
      ? PlayerState.Playing
      : hasPlayed
        ? PlayerState.Paused
        : PlayerState.None;

  useEffect(() => {
    let mounted = true;
    const setupPlayer = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
        });
        player.setActiveForLockScreen(true, {
          title: 'Radio Border Retro Music',
          artist: 'En Vivo',
        });
      } catch (e) {
        console.log('Error setting up player:', e);
      } finally {
        if (mounted) {
          setIsSetup(true);
        }
      }
    };

    setupPlayer();

    return () => {
      mounted = false;
    };
  }, [player]);

  useEffect(() => {
    if (!status?.playing) {
      return;
    }

    let cancelled = false;
    const fetchMetadata = async () => {
      try {
        const response = await fetch(STATS_URL);
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled || !data?.songtitle) return;

        const parts = data.songtitle.split(' - ');
        const nextArtist = parts.length > 1 ? parts[0].trim() : 'En Vivo';
        const nextTitle =
          parts.length > 1
            ? parts.slice(1).join(' - ').trim()
            : data.songtitle.trim();

        if (nextTitle) {
          setTrackTitle(nextTitle);
          setTrackArtist(nextArtist);
          player.updateLockScreenMetadata({
            title: nextTitle,
            artist: nextArtist,
          });
        }
      } catch {
        // Ignore network errors on metadata polling
      }
    };

    fetchMetadata();
    const interval = setInterval(fetchMetadata, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [status?.playing, player]);

  const togglePlayback = async () => {
    if (status?.playing) {
      player.pause();
      setHasPlayed(true);
      setIsLive(false);
    } else {
      player.play();
      setHasPlayed(true);
    }
  };

  const goLive = async () => {
    try {
      setIsLive(true);
      setHasPlayed(true);
      player.replace(STREAM_URL);
      player.play();
    } catch (error) {
      console.error('Error going live:', error);
    }
  };

  return {
    isSetup,
    isPlaying,
    togglePlayback,
    goLive,
    isLive,
    playerState,
    trackTitle,
    trackArtist,
  };
};
