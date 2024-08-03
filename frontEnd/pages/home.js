import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Home({ token, setToken }) {
  const [profile, setProfile] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    setToken(null);
  };

  const handleCreateRoom = async () => {
    try {
      const response = await fetch('https://hackthe6ix.onrender.com/create_room', {
        method: 'POST',
      });
      const data = await response.json();
      navigation.navigate('Room', { roomId: data.room_id, token, profile });
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <View style={styles.container}>
      {profile && (
        <View style={styles.header}>
          {profile.images.length > 0 && (
            <Image source={{ uri: profile.images[0].url }} style={styles.profileImage} />
          )}
          <Text style={styles.userName}>{profile.display_name}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.roomButton} onPress={handleCreateRoom}>
        <Text style={styles.roomButtonText}>Create Room</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.roomButton}>
        <Text style={styles.roomButtonText}>Join Room</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userName: {
    fontSize: 18,
    color: '#FFF',
    marginLeft: "-30%",
  },
  logoutButton: {
    backgroundColor: '#1DB954',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  roomButton: {
    backgroundColor: '#1DB954',
    width: '80%',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 40,
    alignSelf: 'center',
  },
  roomButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
});
