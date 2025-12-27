import React from 'react';
import renderer, { act } from 'react-test-renderer';
import App from './App';

// ... (mocks stay the same)

describe('<App />', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders correctly', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<App />);
        });
        expect(tree.toJSON()).toBeDefined();
    });
});

// Mock React Native Track Player
jest.mock('react-native-track-player', () => ({
    Capability: {},
    State: {},
    Event: {},
    usePlaybackState: () => ({ state: 'None' }),
    setupPlayer: jest.fn(),
    updateOptions: jest.fn(),
    add: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    getActiveTrackIndex: jest.fn(),
    getPlaybackState: jest.fn(),
}));

// Mock Expo Fonts
jest.mock('expo-font');
jest.mock('@expo-google-fonts/limelight', () => ({
    useFonts: () => [true],
    Limelight_400Regular: 'Limelight_400Regular',
}));
jest.mock('@expo-google-fonts/montserrat', () => ({
    Montserrat_400Regular: 'Montserrat_400Regular',
    Montserrat_600SemiBold: 'Montserrat_600SemiBold',
}));

// Mock Splash Screen
jest.mock('expo-splash-screen', () => ({
    preventAutoHideAsync: jest.fn(),
    hideAsync: jest.fn(),
}));

jest.mock('./components/SplashScreen', () => {
    const { View } = require('react-native');
    return () => <View testID="mock-splash-screen" />;
});

// Mock Vector Icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

