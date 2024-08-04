import React, { useEffect } from "react";
import { StyleSheet, View, Text, Image, FlatList } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function Leaderboard() {
  const route = useRoute();
  const navigation = useNavigation();
  const { leaderboard } = route.params;

  useEffect(() => {
    // Set a timeout to navigate back to Start.js after 5 seconds
    const timer = setTimeout(() => {
      navigation.goBack();
    }, 5000);

    // Clear the timeout if the component is unmounted before the timeout completes
    return () => clearTimeout(timer);
  }, [navigation]);

  const renderPlayer = ({ item }) => (
    <View style={styles.playerBox}>
      <Image source={{ uri: item.profile_image }} style={styles.profileImage} />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.username}</Text>
        <Text style={styles.points}>{item.points} points</Text>
        <Text style={styles.responseTime}>Response Time: {item.response_time.toFixed(2)} seconds</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Leaderboard</Text>

      <FlatList
        data={leaderboard}
        renderItem={renderPlayer}
        keyExtractor={(item, index) => index.toString()}
        style={styles.leaderboardList}
      />

      <Text style={styles.playerCount}>{leaderboard.length} Players</Text>
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
  responseTime: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 5,
  },
  playerCount: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 20,
  },
});

 