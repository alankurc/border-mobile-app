import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const SplashScreen = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Infinite spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000, // 3 seconds per rotation
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        style={[styles.logo, { transform: [{ rotate: spin }] }]}
        source={require('../assets/splash-icon.png')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Match app theme
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
