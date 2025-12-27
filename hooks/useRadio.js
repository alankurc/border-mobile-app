import { useEffect, useState } from 'react';
import TrackPlayer, {
    Capability,
    State,
    usePlaybackState,
    AppKilledPlaybackBehavior,
    Event,
} from 'react-native-track-player';

const STREAM_URL = 'https://miestacion.turadioonline.com.ar:7115/stream';

export const useRadio = () => {
    const [isSetup, setIsSetup] = useState(false);
    const playerState = usePlaybackState();
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (
            playerState.state === State.Playing ||
            playerState.state === State.Buffering
        ) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    }, [playerState]);

    const setupPlayer = async () => {
        try {
            await TrackPlayer.setupPlayer();
            await TrackPlayer.updateOptions({
                android: {
                    appKilledPlaybackBehavior:
                        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
                },
                capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
                compactCapabilities: [Capability.Play, Capability.Pause],
                notificationCapabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.Stop,
                ],
            });
            await TrackPlayer.add({
                id: 'radio-stream',
                url: STREAM_URL,
                title: 'Radio Border Retro Music',
                artist: 'En Vivo',
                contentType: 'audio/mpeg',
            });

            setIsSetup(true);
        } catch (e) {
            console.log('Error setting up player:', e);
            // It might be already setup, so we can ignore or check specifically
            setIsSetup(true);
        }
    };

    useEffect(() => {
        setupPlayer();
    }, []);

    const togglePlayback = async () => {
        const currentTrack = await TrackPlayer.getActiveTrackIndex();
        if (currentTrack === undefined) {
            // If queue is empty (shouldn't happen with our setup), re-add
            await TrackPlayer.add({
                id: 'radio-stream',
                url: STREAM_URL,
                title: 'Radio Border Retro Music',
                artist: 'En Vivo',
                contentType: 'audio/mpeg',
            });
        }

        const state = (await TrackPlayer.getPlaybackState()).state;
        if (state === State.Playing) {
            await TrackPlayer.pause();
        } else {
            await TrackPlayer.play();
        }
    };


    const [trackTitle, setTrackTitle] = useState('Estamos al aire');
    const [trackArtist, setTrackArtist] = useState('En Vivo');

    useEffect(() => {
        let sub = null;

        const listener = TrackPlayer.addEventListener(Event.PlaybackMetadataReceived, async (event) => {
            if (event.title) {
                setTrackTitle(event.title);
            }
            if (event.artist) {
                setTrackArtist(event.artist);
            }
        });

        return () => {
            listener.remove();
        };
    }, []);

    return {
        isSetup,
        isPlaying,
        togglePlayback,
        playerState: playerState.state,
        trackTitle,
        trackArtist,
    };
};
