import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import Modal from "react-native-modal";

// Helper function to format number with spaces
const formatNumberWithSpaces = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const CustomModal = ({
  isVisible,
  onClose,
  token,
  artist,
  setArtist,
  artistImage,
  artistName,
  artistFollowers,
  questionType,
  setQuestionType,
  handleCreateRoom,
}) => {
  useEffect(() => {
    if (artist.trim() !== "") {
      fetchArtistImage();
    }
  }, [artist]);

  const fetchArtistImage = async () => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          artist
        )}&type=artist`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.artists && data.artists.items && data.artists.items.length > 0) {
        const artistItem = data.artists.items[0];
        setArtistImage(artistItem.images[0]?.url || null);
        setArtistName(artistItem.name || "");
        setArtistFollowers(formatNumberWithSpaces(artistItem.followers.total) || ""); // Format
      } else {
        setArtistImage(null);
        setArtistName("");
        setArtistFollowers("");
      }
    } catch (error) {
      console.error("Error fetching artist image:", error);
      setArtistImage(null);
      setArtistName("");
      setArtistFollowers("");
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Create Room</Text>
        <Text style={styles.sectionTitle}>Choose an Artist</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter artist name"
          placeholderTextColor="#666"
          value={artist}
          onChangeText={setArtist}
        />
        <View style={styles.artistContainer}>
          {artistImage && (
            <Image source={{ uri: artistImage }} style={styles.artistImage} />
          )}
          <View>
            <Text style={styles.artistName}>{artistName}</Text>
            <Text style={styles.artistFollowers}>
              {artistFollowers} Followers
            </Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Question Type</Text>
        <View style={styles.questionTypeContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              questionType === "Audio" && styles.selectedOption,
            ]}
            onPress={() => setQuestionType("Audio")}
          >
            <Text style={styles.optionText}>Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              questionType === "No Audio" && styles.selectedOption,
            ]}
            onPress={() => setQuestionType("No Audio")}
          >
            <Text style={styles.optionText}>No Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              questionType === "Both" && styles.selectedOption,
            ]}
            onPress={() => setQuestionType("Both")}
          >
            <Text style={styles.optionText}>Both</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.createRoomButton}
          onPress={handleCreateRoom}
        >
          <Text style={styles.createRoomButtonText}>Create Room</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
    marginTop: 50,
  },
  artistContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  artistName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  artistFollowers: {
    fontSize: 16,
    color: "#666",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#DDD",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  questionTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    backgroundColor: "#1DB954",
    borderRadius: 5,
    paddingVertical: 10,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
  selectedOption: {
    backgroundColor: "#0A8F4C", // Darker green for selected option
  },
  createRoomButton: {
    backgroundColor: "#1DB954",
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 250,
  },
  createRoomButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});

export default CustomModal;
