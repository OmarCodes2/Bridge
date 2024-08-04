import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import { useNavigation } from "@react-navigation/native";

export default function Start({ route }) {
  const { roomId, players, profile, first } = route.params;
  const [sound, setSound] = useState();
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const [mp3Url, setMp3Url] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // State to track submission
  const ws = useRef(null);
  const timeoutRef = useRef(null);
  const [leaderboard, setLeaderboard] = useState();
  const navigation = useNavigation();

  useEffect(() => {
    ws.current = new WebSocket(`wss://hackthe6ix.onrender.com/ws/${roomId}`);

    ws.current.onopen = () => {
      console.log("Connected to WebSocket");
      if (first === "first") {
        ws.current.send(JSON.stringify({ action: "start" }));
      }
    };

    ws.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "question") {
        clearTimeout(timeoutRef.current); // Clear the previous timeout
        if (sound) {
          await sound.stopAsync(); // Stop the current sound if it's playing
        }

        // Reset selected option and submission status before setting new options
        setSelectedOption(null);
        setIsSubmitted(false);

        // Process options to keep text before parentheses
        const processedOptions = message.data.options.map((option) => ({
          ...option,
          text: option.text.split("(")[0].trim(), // keep text before parentheses
        }));

        setOptions(processedOptions);
        setMp3Url(message.data.mp3);
        await playSound(message.data.mp3);
      } else if (message.type === "standings") {
        console.log(message);
        setLeaderboard(message.data);
        if (sound) {
          await sound.stopAsync(); // Stop the current sound if it's playing
        }
        navigation.navigate("Leaderboard", { leaderboard: message.data });
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket closed");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [roomId]);

  async function playSound(mp3) {
    try {
      const { sound } = await Audio.Sound.createAsync({
        uri: mp3,
      });
      setSound(sound);
      await sound.playAsync();
      setLoading(false);

      // Stop the sound after 10 seconds
      timeoutRef.current = setTimeout(async () => {
        if (sound) {
          await sound.stopAsync();
        }
      }, 9500);
    } catch (error) {
      console.error("Error loading or playing audio:", error);
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
      setIsSubmitted(true); // Mark as submitted
      ws.current.send(
        JSON.stringify({
          action: "answer",
          username: profile.display_name,
          answer: selectedOption.text,
        })
      );
    }
  };

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
              disabled={isSubmitted} // Disable option selection after submission
            >
              <Image
                source={{ uri: option.album_cover }}
                style={styles.optionImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleOptionSelect(option)}
              disabled={isSubmitted} // Disable option selection after submission
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
        style={[
          styles.submitButton,
          (!selectedOption || isSubmitted) && styles.disabledButton, // Apply disabled style
        ]}
        onPress={handleSubmit}
        disabled={!selectedOption || isSubmitted} // Disable the button after submission
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
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
    backgroundColor: "#4CAF50", // Greyed-out color for the disabled state
    opacity: 0.5, // Add opacity to further distinguish the disabled state
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
