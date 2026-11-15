import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRadio, PlayerState } from './hooks/useRadio';
import ContactView from './components/ContactView';
import SplashScreen from './components/SplashScreen';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Limelight_400Regular } from '@expo-google-fonts/limelight';
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_300Light,
} from '@expo-google-fonts/montserrat';
import * as ExpoSplashScreen from 'expo-splash-screen';

// Keep native splash screen visible while we load resources
ExpoSplashScreen.preventAutoHideAsync();

const formatRemainingTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const TabButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.activeTabButton]}
    onPress={onPress}
  >
    <Text
      style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('radio');
  const {
    isSetup,
    isPlaying,
    togglePlayback,
    playerState,
    trackTitle,
    trackArtist,
    goLive,
    isLive,
    sleepTimerRemaining,
    cycleSleepTimer,
  } = useRadio();
  const [appIsReady, setAppIsReady] = useState(false);
  const [pulseAnim] = useState(() => new Animated.Value(0));

  let [fontsLoaded] = useFonts({
    Limelight_400Regular,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_300Light,
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        setAppIsReady(true);
        await ExpoSplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fontsLoaded]);

  useEffect(() => {
    if (playerState === PlayerState.Playing) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(0);
    }
  }, [playerState, pulseAnim]);

  if (!appIsReady) {
    return <SplashScreen />;
  }

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.45],
  });

  const renderTrackInfo = () => {
    return (
      <View style={styles.trackInfoContainer}>
        <Text style={styles.trackTitle}>{trackTitle}</Text>
        <View style={styles.artistRow}>
          <Animated.View
            style={[
              styles.livePulseDot,
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
              },
            ]}
          />
          <Text style={styles.trackArtist}>{trackArtist}</Text>
        </View>
      </View>
    );
  };

  const renderStatus = () => {
    if (playerState === PlayerState.Playing) {
      return renderTrackInfo();
    }
    if (playerState === PlayerState.Error) {
      return (
        <View style={styles.trackInfoContainer}>
          <Text style={styles.errorTitle}>Sin conexión al stream</Text>
          <Text style={styles.trackArtist}>Tocá Reintentar para conectar</Text>
        </View>
      );
    }
    return (
      <Text style={styles.statusText}>
        {playerState === PlayerState.Buffering ? 'Buffering...' : 'Escuchanos!'}
      </Text>
    );
  };

  const isTimerActive = sleepTimerRemaining !== null;

  const renderContent = () => {
    if (activeTab === 'contact') {
      return <ContactView />;
    }

    return (
      <View style={styles.radioContainer}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
        <View style={styles.statusContainer}>{renderStatus()}</View>

        <TouchableOpacity
          style={styles.controlContainer}
          onPress={togglePlayback}
          disabled={!isSetup}
        >
          {!isSetup ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <View style={styles.playButtonWrapper}>
                {playerState === PlayerState.Playing && (
                  <Animated.View
                    style={[
                      styles.pulseHalo,
                      {
                        transform: [{ scale: pulseScale }],
                        opacity: pulseOpacity,
                      },
                    ]}
                  />
                )}
                <Ionicons
                  name={
                    playerState === PlayerState.Error
                      ? 'refresh-circle'
                      : isPlaying
                        ? 'pause-circle'
                        : 'play-circle'
                  }
                  size={120}
                  color="#fff"
                />
              </View>
              <Text style={styles.controlText}>
                {playerState === PlayerState.Error
                  ? 'REINTENTAR'
                  : isPlaying
                    ? 'PAUSA'
                    : 'PLAY'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.goLiveButton, isLive && styles.goLiveButtonDisabled]}
            onPress={goLive}
            disabled={isLive}
          >
            <View style={styles.goLiveContainer}>
              <View style={[styles.redDot, isLive && styles.redDotDisabled]} />
              <Text
                style={[styles.goLiveText, isLive && styles.goLiveTextDisabled]}
              >
                IR AL VIVO
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.timerButton,
              isTimerActive && styles.timerButtonActive,
            ]}
            onPress={cycleSleepTimer}
          >
            <View style={styles.goLiveContainer}>
              <Ionicons
                name={isTimerActive ? 'moon' : 'moon-outline'}
                size={18}
                color={isTimerActive ? '#FFD54F' : '#FFF'}
                style={styles.timerIcon}
              />
              <Text
                style={[
                  styles.goLiveText,
                  isTimerActive && styles.timerTextActive,
                ]}
              >
                {isTimerActive
                  ? formatRemainingTime(sleepTimerRemaining)
                  : 'SLEEP'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={styles.container}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <StatusBar style="light" />

        <View style={styles.content}>{renderContent()}</View>

        <View style={styles.tabBar}>
          <TabButton
            title="Radio"
            isActive={activeTab === 'radio'}
            onPress={() => setActiveTab('radio')}
          />
          <TabButton
            title="Contacto"
            isActive={activeTab === 'contact'}
            onPress={() => setActiveTab('contact')}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 6,
    paddingBottom: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#ff0000',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Montserrat_600SemiBold',
  },
  activeTabButtonText: {
    color: '#fff',
    fontWeight: 'normal',
  },
  radioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  statusContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 28,
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'Limelight_400Regular',
  },
  errorTitle: {
    fontSize: 22,
    color: '#FF5252',
    marginBottom: 8,
    paddingHorizontal: 20,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
  controlContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  playButtonWrapper: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseHalo: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#8C5230',
  },
  controlText: {
    color: '#fff',
    fontSize: 24,
    marginTop: 10,
    letterSpacing: 2,
    fontFamily: 'Limelight_400Regular',
  },
  trackTitle: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 10,
    paddingHorizontal: 20,
    fontFamily: 'Limelight_400Regular',
    textAlign: 'center',
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 8,
  },
  trackArtist: {
    fontSize: 18,
    color: '#FFF',
    fontFamily: 'Montserrat_300Light',
    textAlign: 'center',
  },
  trackInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    gap: 12,
  },
  goLiveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  timerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timerButtonActive: {
    borderColor: '#FFD54F',
    backgroundColor: '#2A2416',
  },
  timerIcon: {
    marginRight: 6,
  },
  timerTextActive: {
    color: '#FFD54F',
  },
  goLiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF0000',
    marginRight: 8,
  },
  goLiveText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    letterSpacing: 1,
  },
  goLiveButtonDisabled: {
    opacity: 0.5,
  },
  redDotDisabled: {
    backgroundColor: '#555',
  },
  goLiveTextDisabled: {
    color: '#888',
  },
});
