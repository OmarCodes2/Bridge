import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';

export default function Room({ route }) {
  const { roomId, token, profile } = route.params;
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(`wss://hackthe6ix.onrender.com/ws/${roomId}`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'join',
        username: profile.display_name,
        profile_image: profile.images[0]?.url || '',
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'players') {
        setPlayers(message.data);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [roomId, profile]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Room ID: {roomId}</Text>
      {players.map((player, index) => (
        <View key={index} style={styles.player}>
          <Image source={{ uri: player.profile_image }} style={styles.profileImage} />
          <Text style={styles.playerName}>{player.username}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  playerName: {
    fontSize: 18,
    color: '#FFF',
    marginLeft: 10,
  },
});
