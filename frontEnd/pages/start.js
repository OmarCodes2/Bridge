import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Audio } from "expo-av";

export default function Start({ navigation }) {
  const [sound, setSound] = useState();
  const [loading, setLoading] = useState(true); // Add loading state
  const [selectedOption, setSelectedOption] = useState(null);

  const options = [
    {
      text: "SICKO MODE",
      is_correct: false,
      imageUri: "https://via.placeholder.com/150",
    },
    {
      text: "GOOSEBUMPS",
      is_correct: false,
      imageUri: "https://via.placeholder.com/150",
    },
    {
      text: "HIGHEST ROOM",
      is_correct: true,
      imageUri: "https://via.placeholder.com/150",
    },
    {
      text: "MY EYES",
      is_correct: false,
      imageUri: "https://via.placeholder.com/150",
    },
  ];

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync({
        uri: "https://p.scdn.co/mp3-preview/387b31c31b72f0c16e33d0c78bab869b0a0f4eb3?cid=e889604d871c4325a8adcf6b1e8bbaad",
      });
      setSound(sound);
      await sound.playAsync();
      setLoading(false); // update loading states
    } catch (error) {
      Alert.alert("Error", "Failed to load or play the audio.");
      console.error(error);
    }
  }

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    if (option.is_correct) {
      console.log("Correct!");
    } else {
      console.log("Incorrect!");
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      Alert.alert("Submission", `You selected: ${selectedOption.text}`);
    } else {
      Alert.alert("No Selection", "Please select an option before submitting.");
    }
  };

  useEffect(() => {
    playSound();
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guess the Song</Text>

      {/* Options Grid */}
      <View style={styles.gridContainer}>
        {options.map((option, index) => (
          <View
            key={index}
            style={[
              styles.optionContainer,
              selectedOption &&
                selectedOption.text === option.text &&
                styles.selectedOptionContainer,
            ]}
          >
            <TouchableOpacity
              style={styles.optionImageContainer}
              onPress={() => handleOptionSelect(option)}
            >
              <Image
                source={{ uri: option.imageUri }}
                style={styles.optionImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleOptionSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOption &&
                    selectedOption.text === option.text &&
                    styles.selectedOptionText,
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, !selectedOption && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={!selectedOption}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.loginButtonText}>Go to Login</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#191414",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1DB954",
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 10,
  },
  optionContainer: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    margin: 5,
    width: "45%", // Adjust width for grid layout
    height: 150, // Adjust height for grid layout
    justifyContent: "center",
    // Remove background color
  },
  optionImageContainer: {
    marginBottom: 10,
  },
  optionImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  optionButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  selectedOptionContainer: {
    // Optional: You can add a border or other styles to indicate selection
    borderWidth: 2,
    borderColor: "#1DB954",
  },
  selectedOptionText: {
    color: "#FFF",
  },
  submitButton: {
    backgroundColor: "#1DB954",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 50,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#4CAF50", // Lighter green for disabled state
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#1DB954",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 50,
    marginTop: 30,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
