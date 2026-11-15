import { renderHook, act } from '@testing-library/react-native';
import { useRadio, PlayerState } from '../hooks/useRadio';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio';

jest.mock('expo-audio', () => ({
  useAudioPlayer: jest.fn(),
  useAudioPlayerStatus: jest.fn(),
  setAudioModeAsync: jest.fn(),
}));

describe('useRadio Hook', () => {
  let mockPlayer;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlayer = {
      play: jest.fn(),
      pause: jest.fn(),
      replace: jest.fn(),
      setActiveForLockScreen: jest.fn(),
      updateLockScreenMetadata: jest.fn(),
    };
    useAudioPlayer.mockReturnValue(mockPlayer);
    useAudioPlayerStatus.mockReturnValue({
      playing: false,
      isBuffering: false,
      isLoaded: true,
    });
    setAudioModeAsync.mockResolvedValue(undefined);
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ songtitle: '' }),
      }),
    );
  });

  test('initializes correctly and sets up player', async () => {
    const { result } = renderHook(() => useRadio());

    await act(async () => {});

    expect(setAudioModeAsync).toHaveBeenCalledWith({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
    expect(mockPlayer.setActiveForLockScreen).toHaveBeenCalledWith(true, {
      title: 'Radio Border Retro Music',
      artist: 'En Vivo',
    });
    expect(result.current.isSetup).toBe(true);
  });

  test('reflects isPlaying state when player is playing', async () => {
    useAudioPlayerStatus.mockReturnValue({
      playing: true,
      isBuffering: false,
      isLoaded: true,
    });
    const { result } = renderHook(() => useRadio());

    await act(async () => {});

    expect(result.current.isPlaying).toBe(true);
    expect(result.current.playerState).toBe(PlayerState.Playing);
  });

  test('toggles playback from playing to paused', async () => {
    useAudioPlayerStatus.mockReturnValue({
      playing: true,
      isBuffering: false,
      isLoaded: true,
    });

    const { result } = renderHook(() => useRadio());

    await act(async () => {
      await result.current.togglePlayback();
    });

    expect(mockPlayer.pause).toHaveBeenCalled();
  });

  test('updates track metadata from stream stats when playing', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ songtitle: 'New Artist - New Song' }),
      }),
    );
    useAudioPlayerStatus.mockReturnValue({
      playing: true,
      isBuffering: false,
      isLoaded: true,
    });

    const { result } = renderHook(() => useRadio());

    await act(async () => {});

    expect(result.current.trackTitle).toBe('New Song');
    expect(result.current.trackArtist).toBe('New Artist');
    expect(mockPlayer.updateLockScreenMetadata).toHaveBeenCalledWith({
      title: 'New Song',
      artist: 'New Artist',
    });
  });

  test('goLive reloads stream and starts playing', async () => {
    const { result } = renderHook(() => useRadio());

    await act(async () => {
      await result.current.goLive();
    });

    expect(mockPlayer.replace).toHaveBeenCalled();
    expect(mockPlayer.play).toHaveBeenCalled();
    expect(result.current.isLive).toBe(true);
  });
});
