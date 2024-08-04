import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Modal from "react-native-modal";

// Helper function to format number with spaces
const formatNumberWithSpaces = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export default function Home({ token, setToken }) {
  const [profile, setProfile] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [artist, setArtist] = useState("");
  const [artistImage, setArtistImage] = useState(null);
  const [artistName, setArtistName] = useState("");
  const [artistFollowers, setArtistFollowers] = useState("");
  const [questionType, setQuestionType] = useState("");
  const navigation = useNavigation();

  const gridItems = [
    {
      id: 1,
      title: "Item 1",
    },
    {
      id: 2,
      title: "Item 2",
    },
    {
      id: 3,
      title: "Item 3",
    },
    {
      id: 4,
      title: "Item 4",
    },
  ];

  useEffect(() => {
    async function fetchProfile() {
      console.log(token);
      try {
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }

    fetchProfile();
  }, [token]);

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
        setArtistFollowers(
          formatNumberWithSpaces(artistItem.followers.total) || ""
        ); // Format
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

  const handleLogout = () => {
    setToken(null);
  };

  const handleCreateRoom = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/create_room`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      console.log(data);
      navigation.navigate("Room", { roomId: data.room_id, token, profile });
      setModalVisible(false);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleJoinRoom = () => {
    navigation.navigate("SearchRoom", { token, profile });
  };
  const handleStartGame = () => {
    navigation.navigate("Start"); // Navigate to Start page
  };

  const toggleModal = (item) => {
    setSelectedItem(item);
    setModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      {profile && (
        <View style={styles.header}>
          {profile.images.length > 0 && (
            <Image
              source={{ uri: profile.images[0].url }}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.userName}>{profile.display_name}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Grid Layout */}
      <View style={styles.gridContainer}>
        {gridItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.gridItem}
            onPress={() => toggleModal(item)}
          >
            <Text style={styles.gridText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Join Room Button */}
      <TouchableOpacity style={styles.roomButton} onPress={handleJoinRoom}>
        <Text style={styles.roomButtonText}>Join Game</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.roomButton} onPress={handleJoinRoom}>
        <Text style={styles.roomButtonText}>Start Game</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userName: {
    fontSize: 18,
    color: "#FFF",
    marginLeft: "-30%",
  },
  logoutButton: {
    backgroundColor: "#1DB954",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 20,
  },
  gridItem: {
    backgroundColor: "#1DB954",
    width: "48%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 5,
  },
  gridText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  roomButton: {
    backgroundColor: "#1DB954",
    width: "80%",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 40,
    alignSelf: "center",
  },
  roomButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
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
  closeButton: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#000",
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
