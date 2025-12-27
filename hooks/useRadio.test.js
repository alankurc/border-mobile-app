import { renderHook, act } from '@testing-library/react-native';
import { useRadio } from '../hooks/useRadio';
import TrackPlayer, { State, Event } from 'react-native-track-player';

// Mock TrackPlayer methods and constants
jest.mock('react-native-track-player', () => ({
    Capability: {
        Play: 'Play',
        Pause: 'Pause',
        Stop: 'Stop',
    },
    AppKilledPlaybackBehavior: {
        StopPlaybackAndRemoveNotification: 'StopPlaybackAndRemoveNotification',
    },
    State: {
        Playing: 'playing',
        Paused: 'paused',
        Buffering: 'buffering',
        None: 'none',
    },
    Event: {
        PlaybackMetadataReceived: 'playback-metadata-received',
    },
    setupPlayer: jest.fn(),
    updateOptions: jest.fn(),
    add: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    getActiveTrackIndex: jest.fn(),
    getPlaybackState: jest.fn(),
    usePlaybackState: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

describe('useRadio Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TrackPlayer.usePlaybackState.mockReturnValue({ state: State.None });
    });

    test('initializes correctly and sets up player', async () => {
        const { result } = renderHook(() => useRadio());

        expect(result.current.isSetup).toBe(false);

        await act(async () => { });

        expect(TrackPlayer.setupPlayer).toHaveBeenCalled();
        expect(TrackPlayer.add).toHaveBeenCalled();
        expect(result.current.isSetup).toBe(true);
    });

    test('reflects isPlaying state when player is playing', () => {
        TrackPlayer.usePlaybackState.mockReturnValue({ state: State.Playing });
        const { result } = renderHook(() => useRadio());

        expect(result.current.isPlaying).toBe(true);
    });

    test('toggles playback from playing to paused', async () => {
        TrackPlayer.usePlaybackState.mockReturnValue({ state: State.Playing });
        TrackPlayer.getPlaybackState.mockResolvedValue({ state: State.Playing });
        TrackPlayer.getActiveTrackIndex.mockResolvedValue(0);

        const { result } = renderHook(() => useRadio());

        await act(async () => {
            await result.current.togglePlayback();
        });

        expect(TrackPlayer.pause).toHaveBeenCalled();
    });

    test('updates track metadata when event is received', async () => {
        let listenerCallback;
        TrackPlayer.addEventListener.mockImplementation((event, callback) => {
            if (event === Event.PlaybackMetadataReceived) {
                listenerCallback = callback;
            }
            return { remove: jest.fn() };
        });

        const { result } = renderHook(() => useRadio());

        await act(async () => {
            if (listenerCallback) {
                listenerCallback({ title: 'New Song', artist: 'New Artist' });
            }
        });

        expect(result.current.trackTitle).toBe('New Song');
        expect(result.current.trackArtist).toBe('New Artist');
    });
});
