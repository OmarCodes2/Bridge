import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ResponseType, useAuthRequest } from "expo-auth-session";

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export default function Login({ setToken }) {
  const { height } = Dimensions.get("window");
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_KEY,
      scopes: [
        "user-read-currently-playing",
        "user-read-recently-played",
        "user-read-playback-state",
        "user-top-read",
        "user-modify-playback-state",
        "streaming",
        "user-read-email",
        "user-read-private",
      ],
      usePKCE: false,
      redirectUri: process.env.EXPO_PUBLIC_REDIRECT_URL,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      setToken(access_token);
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/background.png")}
        style={[styles.background, { height: height / 2 }]}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,1)"]}
          style={styles.gradient}
        />
      </ImageBackground>
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.bridgeText}>BRIDGE</Text>
        </View>
        <Text style={styles.title}>Connecting Friends Through Music</Text>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => promptAsync()}
        >
          <View style={styles.buttonContent}>
            <Image
              source={require("../assets/blackLogo.png")}
              style={styles.buttonLogo}
            />
            <Text style={styles.signUpText}>Connect Spotify Account</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#000",
  },
  background: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    alignItems: "center",
    paddingTop: 30,
    width: "100%",
    position: "absolute",
    bottom: "15%",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 60,
  },
  bridgeText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#1db954",
    marginLeft: 10,
  },
  title: {
    fontSize: 35,
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },
  signUpButton: {
    backgroundColor: "#1db954",
    width: "80%",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 40,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  signUpText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
});
