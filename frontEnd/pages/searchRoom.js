import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SearchRoom({ token, profile }) {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleSearchRoom = () => {
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
      if (message.type === 'error') {
        setError(message.message);
        ws.close();
      } else {
        navigation.navigate('Room', { roomId, token, profile });
      }
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('An error occurred while searching for the room.');
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for a Room</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Room ID"
        value={roomId}
        onChangeText={setRoomId}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearchRoom}>
        <Text style={styles.searchButtonText}>Search Room</Text>
      </TouchableOpacity>
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
  input: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 10,
    color: '#000',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#1DB954',
    width: '80%',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 40,
    alignSelf: 'center',
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
});
