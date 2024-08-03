import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ResponseType, useAuthRequest } from 'expo-auth-session';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export default function Login({ setToken }) {
  const { height } = Dimensions.get('window');
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_KEY,
      scopes: [
        'user-read-currently-playing',
        'user-read-recently-played',
        'user-read-playback-state',
        'user-top-read',
        'user-modify-playback-state',
        'streaming',
        'user-read-email',
        'user-read-private',
      ],
      usePKCE: false,
      redirectUri: process.env.EXPO_PUBLIC_REDIRECT_URL,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      setToken(access_token);
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/background.png')} style={[styles.background, { height: height / 2 }]}>
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
          style={styles.gradient}
        />
      </ImageBackground>
      <View style={styles.contentContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Millions of Games.</Text>
        <Text style={styles.title}>Free on Sparky.</Text>
        <TouchableOpacity style={styles.signUpButton} onPress={() => promptAsync()}>
          <Text style={styles.signUpText}>Connect Spotify Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  background: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    alignItems: 'center',
    paddingTop: 30,
    width: '100%',
    position: 'absolute',
    bottom: "30%",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: '#1DB954',
    width: '80%',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 40,
  },
  signUpText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
});
