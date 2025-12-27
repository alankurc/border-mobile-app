import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ContactView = () => {
  const openLink = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error('No se pudo cargar la página', err),
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contactanos!</Text>

      <TouchableOpacity
        style={[styles.button, styles.instagram]}
        onPress={() =>
          openLink('https://www.instagram.com/radioborderretromusic/')
        }
      >
        <Ionicons
          name="logo-instagram"
          size={24}
          color="#FFF"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Instagram</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.whatsapp]}
        onPress={() => openLink('https://wa.me/5401134648486?text=Hola!')}
      >
        <Ionicons
          name="logo-whatsapp"
          size={24}
          color="#FFF"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.facebook]}
        onPress={() =>
          openLink(
            'https://www.facebook.com/Radio-Border-Retro-Music-100245301354810',
          )
        }
      >
        <Ionicons
          name="logo-facebook"
          size={24}
          color="#FFF"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Facebook</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      <TouchableOpacity
        style={[styles.button, styles.website]}
        onPress={() => openLink('https://radioborderretromusic.com/')}
      >
        <Ionicons
          name="globe-outline"
          size={24}
          color="#FFF"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Conocé nuestra web</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.cafecito]}
        onPress={() => openLink('https://cafecito.app/brm')}
      >
        <Ionicons
          name="cafe-outline"
          size={24}
          color="#FFF"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Invitanos un cafecito</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    color: '#FFF',
    fontFamily: 'Limelight_400Regular',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
  },
  website: {
    backgroundColor: '#00af91',
  },
  instagram: {
    backgroundColor: '#E1306C',
  },
  whatsapp: {
    backgroundColor: '#25D366',
  },
  facebook: {
    backgroundColor: '#3B5998',
  },
  cafecito: {
    backgroundColor: '#00af91',
  },
  separator: {
    height: 1,
    width: '80%',
    backgroundColor: '#333',
    marginVertical: 20,
  },
});

export default ContactView;
