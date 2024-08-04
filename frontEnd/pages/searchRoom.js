import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SearchRoom({ token, profile }) {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleSearchRoom = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/room_exists/${roomId}`);
      const data = await response.json();
      if (data.exists) {
        navigation.navigate('Room', { roomId, token, profile });
      } else {
        setError('Room does not exist');
      }
    } catch (error) {
      console.error('Error checking room existence:', error);
      setError('An error occurred while searching for the room.');
    }
  };

  const spinValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderSpinningIcons = () => {
    const iconSize = 40;
    const rows = 20;
    const cols = 10;
    const spacing = 15;
    const iconSource = require('../assets/magnifyingIcon.png'); // Adjust the path to your icon

    const iconElements = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const iconStyle = {
          width: iconSize,
          height: iconSize,
          position: 'absolute',
          top: i * (iconSize + spacing) + (j % 2 === 0 ? 0 : iconSize / 2),
          left: j * (iconSize + spacing),
          opacity: 0.2,
          transform: [{ rotate: spin }],
        };

        iconElements.push(
          <Animated.Image
            key={`${i}-${j}`}
            source={iconSource}
            style={iconStyle}
          />
        );
      }
    }

    return iconElements;
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {renderSpinningIcons()}
      </View>
      <Text style={styles.title}>Search for a Room</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Room ID"
        placeholderTextColor="#1DB954"
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0b0b0b',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    marginBottom: 20,
    color: '#1DB954',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
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
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignSelf: 'center',
  },
  searchButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
});
