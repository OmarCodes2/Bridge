import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, ImageBackground, TouchableOpacity, Animated, Easing } from 'react-native';
import { useNavigation } from "@react-navigation/native";

export default function Room({ route }) {
  const { roomId, token, profile } = route.params;
  const [players, setPlayers] = useState([]);
  const ws = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    ws.current = new WebSocket(`wss://hackthe6ix.onrender.com/ws/${roomId}`);
    
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({
        action: 'join',
        username: profile.display_name,
        profile_image: profile.images[0]?.url || '',
      }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'players') {
        setPlayers(message.data);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket closed');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [roomId, profile]);

  const renderBackgroundIcons = () => {
    const iconElements = [];
    const iconSize = 40;
    const rows = 15;
    const cols = 10;
    const spacing = 15;
    const defaultIcon = require('../assets/defaultIcon.png');

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const playerIndex = (i * cols + j) % players.length;
        const spinValue = new Animated.Value(0);

        Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 10000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();

        const spin = spinValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        const iconStyle = {
          width: iconSize,
          height: iconSize,
          borderRadius: iconSize / 2,
          position: 'absolute',
          top: i * (iconSize + spacing) + (j % 2 === 0 ? 0 : iconSize / 2),
          left: j * (iconSize + spacing),
          opacity: 0.2,
          transform: [{ rotate: spin }],
        };

        iconElements.push(
          <Animated.Image
            key={`${i}-${j}`}
            source={players.length === 0 ? defaultIcon : { uri: players[playerIndex].profile_image }}
            style={iconStyle}
          />
        );
      }
    }

    return iconElements;
  };

  const renderPlayers = () => {
    const filledPlayers = [...players];
    const defaultIcon = require('../assets/defaultIcon.png');
    
    while (filledPlayers.length < 4) {
      filledPlayers.push({
        profile_image: defaultIcon,
        username: `Player ${filledPlayers.length + 1}`
      });
    }

    return filledPlayers.map((player, index) => (
      <View key={index} style={styles.playerBox}>
        <Image source={typeof player.profile_image === 'string' ? { uri: player.profile_image } : player.profile_image} style={styles.profileImage} />
        <Text style={styles.playerName}>{player.username}</Text>
      </View>
    ));
  };

  const handleStartGame = () => {
    // if (ws.current && ws.current.readyState === WebSocket.OPEN) {
    //   ws.current.send(JSON.stringify({ action: 'start' }));
    // }
    
    // Navigate to the Start screen and pass necessary parameters
    navigation.navigate('Start', {roomId, players, profile});
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../assets/waitingRoomBackground.png')}
        style={styles.background}
        resizeMode="cover"
      />
      <View style={styles.iconContainer}>
        {renderBackgroundIcons()}
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.box}>
          <View style={styles.roomIdContainer}>
            <Text style={styles.roomIdLabel}>Room ID:</Text>
            <Text style={styles.roomId}>{roomId}</Text>
          </View>
          <View style={styles.playersContainer}>
            {renderPlayers()}
          </View>
        </View>
        <Text style={styles.playerCount}>{players.length}/4 Players</Text>
      </View>
      <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    width: '100%',
    height: '50%',
    position: 'absolute',
    top: 0,
    marginBottom: 10,
  },
  iconContainer: {
    position: 'absolute',
    top: '25%',
    width: '100%',
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    marginTop: '55%',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  box: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  roomIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  roomIdLabel: {
    fontSize: 25,
    color: '#1DB954',
    fontWeight: 'bold',
  },
  roomId: {
    fontSize: 25,
    color: '#1DB954',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  playersContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  playerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 50,
    marginVertical: 5,
    padding: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  playerName: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  playerCount: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
  },
  startButton: {
    backgroundColor: '#1DB954',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 30,
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: '60%',
  },
  startButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
});
