import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, FlatList } from "react-native";

export default function Leaderboard() {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    // Fetch the standings data from the backend
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    // Simulating fetching data from the backend
    const response = {
      "type": "standings",
      "data": [
        {
          "username": "test_user 1",
          "profile_image": "https://via.placeholder.com/50", // Replace with actual image URI
          "points": 327,
          "response_time": 6.73499999998603
        },
        {
          "username": "test_user 1",
          "profile_image": "https://via.placeholder.com/50", // Replace with actual image URI
          "points": 327,
          "response_time": 6.73499999998603
        },
        {
          "username": "test_user 1",
          "profile_image": "https://via.placeholder.com/50", // Replace with actual image URI
          "points": 327,
          "response_time": 6.73499999998603
        },
        // Add more user data here
      ]
    };

    setStandings(response.data);
  };

  const renderPlayer = ({ item }) => (
    <View style={styles.playerBox}>
      <Image source={{ uri: item.profile_image }} style={styles.profileImage} />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.username}</Text>
        <Text style={styles.points}>{item.points} points</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Leaderboard</Text>

      <FlatList
        data={standings}
        renderItem={renderPlayer}
        keyExtractor={(item, index) => index.toString()}
        style={styles.leaderboardList}
      />

      <Text style={styles.playerCount}>{standings.length} Players</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80, // Added padding top to move the content down
    paddingBottom: 40,
  },
  title: {
    fontSize: 32, // Increased font size
    color: '#1DB954',
    fontWeight: 'bold',
    marginBottom: 30, // Increased margin to create more space between title and list
  },
  leaderboardList: {
    width: '100%',
  },
  playerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 50,
    marginVertical: 10,
    padding: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  points: {
    fontSize: 18,
    color: '#1DB954',
    marginTop: 5,
  },
  playerCount: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 20,
  },
});