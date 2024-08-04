// pages/start.js
import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";

export default function Start({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Game</Text>
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate("Login")}
      />
      {/* Add more content for the Start page here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
  },
  title: {
    fontSize: 24,
    color: "#FFF",
  },
});
