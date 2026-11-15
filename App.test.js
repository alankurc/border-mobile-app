import React from 'react';
import renderer, { act } from 'react-test-renderer';
import App from './App';

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

// Mock Expo Audio
jest.mock('expo-audio', () => ({
  useAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    setActiveForLockScreen: jest.fn(),
    updateLockScreenMetadata: jest.fn(),
  })),
  useAudioPlayerStatus: jest.fn(() => ({
    playing: false,
    isBuffering: false,
    isLoaded: true,
  })),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
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
  Montserrat_300Light: 'Montserrat_300Light',
}));

// Mock Splash Screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('./components/SplashScreen', () => {
  const { View } = require('react-native');
  const MockSplashScreen = () => <View testID="mock-splash-screen" />;
  return MockSplashScreen;
});

// Mock Vector Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));
