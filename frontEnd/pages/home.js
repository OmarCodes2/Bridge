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
import CustomModal from "../components/customModal";

export default function Home({ token, setToken }) {
  const [profile, setProfile] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [artist, setArtist] = useState("");
  const [artistImage, setArtistImage] = useState(null);
  const [artistName, setArtistName] = useState("");
  const [artistFollowers, setArtistFollowers] = useState("");
  const [artistId, setArtistId] = useState("");
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

  const handleLogout = () => {
    setToken(null);
  };

  const handleCreateRoom = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/create_room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            'token':token,
            'question_type': "hello",
            'quiz_type': "artist",
            'room_object': {'artist': artistId, 'album': ""}
          }),
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

      <TouchableOpacity style={styles.roomButton} onPress={handleStartGame}>
        <Text style={styles.roomButtonText}>Start Game</Text>
      </TouchableOpacity>

      {/* Modal */}
      <CustomModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        token={token}
        artist={artist}
        setArtist={setArtist}
        artistImage={artistImage}
        artistName={artistName}
        artistFollowers={artistFollowers}
        questionType={questionType}
        setQuestionType={setQuestionType}
        handleCreateRoom={handleCreateRoom}
      />
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
});
