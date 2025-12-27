import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRadio } from './hooks/useRadio';
import ContactView from './components/ContactView';
import SplashScreen from './components/SplashScreen';
import { State } from 'react-native-track-player';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Limelight_400Regular } from '@expo-google-fonts/limelight';
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
} from '@expo-google-fonts/montserrat';
import * as ExpoSplashScreen from 'expo-splash-screen';

// Keep native splash screen visible while we load resources
ExpoSplashScreen.preventAutoHideAsync();

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
  const { isSetup, isPlaying, togglePlayback, playerState, trackTitle, trackArtist } = useRadio();
  const [appIsReady, setAppIsReady] = useState(false);

  let [fontsLoaded] = useFonts({
    Limelight_400Regular,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setAppIsReady(true);
        await ExpoSplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fontsLoaded]);

  if (!appIsReady) {
    return <SplashScreen />;
  }

  const renderTrackInfo = () => {
    return (
      <View style={styles.trackInfoContainer}>
        <Text style={styles.trackTitle}>{trackTitle}</Text>
        <Text style={styles.trackArtist}>{trackArtist}</Text>
      </View>
    );
  };

  const renderContent = () => {
    if (activeTab === 'contact') {
      return <ContactView />;
    }

    return (
      <View style={styles.radioContainer}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {playerState === State.Buffering
              ? 'Buffering...'
              : playerState === State.Playing
                ? renderTrackInfo()
                : 'Escuchanos!'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.controlContainer}
          onPress={togglePlayback}
          disabled={!isSetup}
        >
          {!isSetup ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={120}
                color="#fff"
              />
              <Text style={styles.controlText}>
                {isPlaying ? 'PAUSA' : 'PLAY'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={styles.container}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <StatusBar style="auto" />

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
    paddingBottom: 20, // For iPhone X+
    paddingTop: 10,
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
  controlContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'Limelight_400Regular',
  },
  trackArtist: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'Montserrat_100Thin',
  },
  trackInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});
