import { useCallback, useEffect, useState } from 'react';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio';

const STREAM_URL = 'https://miestacion.turadioonline.com.ar:7115/stream';
const STATS_URL =
  'https://miestacion.turadioonline.com.ar:7115/stats?sid=1&json=1';

export const SLEEP_TIMER_OPTIONS = [15, 30, 60];

export const PlayerState = {
  Playing: 'playing',
  Paused: 'paused',
  Buffering: 'buffering',
  Error: 'error',
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
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null);

  const hasError = Boolean(status?.error);
  const isPlaying =
    !hasError && Boolean(status?.playing || status?.isBuffering);
  const playerState = hasError
    ? PlayerState.Error
    : status?.isBuffering
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

  useEffect(() => {
    if (sleepTimerRemaining === null) {
      return;
    }

    const timer = setTimeout(() => {
      if (sleepTimerRemaining <= 1) {
        player.pause();
        setIsLive(false);
        setSleepTimerMinutes(null);
        setSleepTimerRemaining(null);
      } else {
        setSleepTimerRemaining(sleepTimerRemaining - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [sleepTimerRemaining, player]);

  const setSleepTimer = useCallback((minutes) => {
    if (!minutes || minutes <= 0) {
      setSleepTimerMinutes(null);
      setSleepTimerRemaining(null);
    } else {
      setSleepTimerMinutes(minutes);
      setSleepTimerRemaining(minutes * 60);
    }
  }, []);

  const cycleSleepTimer = useCallback(() => {
    const currentIndex = SLEEP_TIMER_OPTIONS.indexOf(sleepTimerMinutes);
    if (currentIndex === -1) {
      setSleepTimer(SLEEP_TIMER_OPTIONS[0]);
    } else if (currentIndex === SLEEP_TIMER_OPTIONS.length - 1) {
      setSleepTimer(null);
    } else {
      setSleepTimer(SLEEP_TIMER_OPTIONS[currentIndex + 1]);
    }
  }, [sleepTimerMinutes, setSleepTimer]);

  const togglePlayback = async () => {
    if (hasError) {
      setIsLive(true);
      setHasPlayed(true);
      player.replace(STREAM_URL);
      player.play();
      return;
    }

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
    error: status?.error || null,
    trackTitle,
    trackArtist,
    sleepTimerMinutes,
    sleepTimerRemaining,
    setSleepTimer,
    cycleSleepTimer,
  };
};
