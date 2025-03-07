import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './pages/login';
import Home from './pages/home';
import Room from './pages/room';
import SearchRoom from './pages/searchRoom';
import Start from './pages/start';  // Import Start component
import Leaderboard from './pages/leaderboard';

const Stack = createStackNavigator();

export default function App() {
  const [token, setToken] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen 
              name="Home" 
              children={(props) => <Home {...props} token={token} setToken={setToken} />} 
            />
            <Stack.Screen 
              name="Room" 
              component={Room} 
            />
            <Stack.Screen 
              name="SearchRoom" 
              children={(props) => <SearchRoom {...props} token={token} profile={props.route.params?.profile} />} 
            />
            <Stack.Screen 
              name="Start" 
              component={Start} 
            />
            <Stack.Screen 
              name="Leaderboard" 
              component={Leaderboard} 
            />
          </>
        ) : (
          <Stack.Screen 
            name="Login" 
            children={(props) => <Login {...props} setToken={setToken} />} 
          />
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
});
