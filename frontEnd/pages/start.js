// pages/start.js
import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, Button, Image } from "react-native";

export default function Start({ navigation }) {
  const [guess, setGuess] = useState("");

  const handleGuessSubmit = () => {
    // Handle guess submission logic here
    console.log("Guess submitted:", guess);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guess the Album Cover</Text>
      
      {/* Album Cover Image */}
      <View style={styles.albumContainer}>
        <Image 
          source={{uri: 'https://via.placeholder.com/150'}} // Replace with your album cover image URI
          style={styles.albumImage}
        />
      </View>

      {/* Text Box for Guessing */}
      <TextInput
        style={styles.input}
        placeholder="Enter your guess"
        value={guess}
        onChangeText={setGuess}
      />

      {/* Submit Button */}
      <Button
        title="Submit Guess"
        onPress={handleGuessSubmit}
      />
      
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate("Login")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#282c34",
  },
  title: {
    fontSize: 24,
    color: "#FFF",
    marginBottom: 20,
  },
  albumContainer: {
    marginBottom: 20,
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  albumImage: {
    width: 150,
    height: 150,
  },
  input: {
    height: 40,
    borderColor: "#FFF",
    borderWidth: 1,
    paddingLeft: 8,
    color: "#FFF",
    marginBottom: 20,
    width: "80%",
  },
});

