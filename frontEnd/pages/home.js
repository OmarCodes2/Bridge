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

const modes = [
  {
    type: 'artist',
    image: require('../assets/artist.png'),
    id: null,
    search: true,
    insert: false,
    description: 'How well do you know your favourite artist?'
  },
  {
    type: 'friend',
    image: require('../assets/friend.png'),
    id: null,
    search: false,
    insert: false,
    description: 'A test based on you and your friends music tastes.'
  },
  {
    type: 'playlist',
    image: require('../assets/playlist.png'),
    id: null,
    search: false,
    insert: true,
    description: 'How well do you know a playlist?'
  },
  {
    type: 'playlist',
    image: require('../assets/kpop.png'),
    id: '3Ir5YWemOTGRRfXgROrsDV',
    search: false,
    insert: false,
    description: 'For all our Kpop stans.'
  },
  {
    type: 'playlist',
    image: require('../assets/rock.png'),
    id: '37i9dQZF1DWXRqgorJj26U',
    search: false,
    insert: false,
    description: 'Test your Rock knowledge!'
  },
  {
    type: 'playlist',
    image: require('../assets/pop.png'),
    id: '34NbomaTu7YuOYnky8nLXL',
    search: false,
    insert: false,
    description: 'Do you know your pop hits?'
  },
  {
    type: 'playlist',
    image: require('../assets/rap.png'),
    id: '37i9dQZF1DX0XUsuxWHRQd',
    search: false,
    insert: false,
    description: 'How good is your rap game?'
  },
  {
    type: 'playlist',
    image: require('../assets/anime.png'),
    id: '1YA5cPIfDy3L03bGnNiDM7',
    search: false,
    insert: false,
    description: 'For all the weebs!'
  }
];

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
  const [playlistLink, setPlaylistLink] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [playlistImage, setPlaylistImage] = useState("");
  const [playlistOwner, setPlaylistOwner] = useState(""); // New state for playlist owner
  const navigation = useNavigation();

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

  useEffect(() => {
    if (selectedItem && selectedItem.insert && playlistLink.trim() !== "") {
      fetchPlaylistDetails();
    }
  }, [playlistLink]);

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
        );
        setArtistId(artistItem.id || "");
      } else {
        setArtistImage(null);
        setArtistName("");
        setArtistFollowers("");
        setArtistId("");
      }
    } catch (error) {
      console.error("Error fetching artist image:", error);
      setArtistImage(null);
      setArtistName("");
      setArtistFollowers("");
      setArtistId("");
    }
  };

  const fetchPlaylistDetails = async () => {
    const playlistId = playlistLink.split('playlist/')[1].split('?')[0];
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
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
      setPlaylistName(data.name);
      setPlaylistImage(data.images[0]?.url || null);
      setPlaylistOwner(data.owner.display_name || ""); // Set playlist owner
      setArtistId(playlistId); // Set the playlist ID as artistId
    } catch (error) {
      console.error("Error fetching playlist details:", error);
      setPlaylistName("");
      setPlaylistImage(null);
      setPlaylistOwner("");
    }
  };

  const handleLogout = () => {
    setToken(null);
  };

  const handleCreateRoom = async () => {
    const roomObject = selectedItem.type === 'artist' ? { artist: artistId, album: "" } : selectedItem.type === 'friend' ? { artist: "", album: "" } : { artist: artistId, album: "" };

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/create_room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            question_type: "hello",
            quiz_type: selectedItem.type,
            room_object: roomObject,
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
    navigation.navigate("Start");
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
        {modes.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.gridItem}
            onPress={() => toggleModal(item)}
          >
            <Image source={item.image} style={styles.gridImage} />
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
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
      >
        <View style={styles.modalContent}>
          {selectedItem && (
            <Text style={styles.modalDescription}>{selectedItem.description}</Text>
          )}
          {selectedItem && selectedItem.search && (
            <>
              <Text style={styles.sectionTitle}>Choose an Artist</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter artist name"
                placeholderTextColor="#1DB954"
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
            </>
          )}
          {selectedItem && selectedItem.insert && (
            <>
              <Text style={styles.sectionTitle}>Enter Playlist Link</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter playlist link"
                placeholderTextColor="#1DB954"
                value={playlistLink}
                onChangeText={setPlaylistLink}
              />
              <View style={styles.artistContainer}>
                {playlistImage && (
                  <Image source={{ uri: playlistImage }} style={styles.artistImage} />
                )}
                <View>
                  <Text style={styles.artistName}>{playlistName}</Text>
                  <Text style={styles.artistFollowers}>
                    Created by {playlistOwner}
                  </Text>
                </View>
              </View>
            </>
          )}
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
    backgroundColor: "#0b0b0b",
    width: "48%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 5,
  },
  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
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
    backgroundColor: "#191818",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
    marginTop: 0,
  },
  modalDescription: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
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
    color: "#FFF",
  },
  artistFollowers: {
    fontSize: 16,
    color: "#1DB954",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#1DB954",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#0b0b0b",
    color: "#1DB954",
    fontWeight: "bold",
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
    fontWeight: "bold",
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
