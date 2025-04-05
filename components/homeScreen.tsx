import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getAuth } from 'firebase/auth';
import HomeContent from './homeContent';
import Profile from './profile';

const auth = getAuth();
const Tab = createBottomTabNavigator();

type UserData = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
};

// Define navigation param types
type ProfileScreenParams = {
  userData: UserData | null;
};

const PlateDetection = () => {
  const [plates, setPlates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = new WebSocket('ws://192.168.1.6:8000/ws');

    socket.onopen = () => {
      console.log('Connected to FastAPI WebSocket');
      setLoading(false);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.plate) {
        setPlates((prev) => [...new Set([data.plate, ...prev])]);
      }
    };

    socket.onerror = (error) => console.error('WebSocket error:', error);
    socket.onclose = () => console.log('WebSocket disconnected');

    return () => socket.close();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detected Plates:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={plates}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={<Text>No plates detected</Text>}
          renderItem={({ item }) => <Text style={styles.plate}>{item}</Text>}
        />
      )}
    </View>
  );
};

// Create a wrapper for Profile to pass updated userData
const ProfileWrapper = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const uid = auth.currentUser?.uid;
  
  // Fix the navigation type issue
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://192.168.1.6:8001/user/${uid}`);
        const data = await response.json();
        console.log("User data fetched in Profile:", data);
        setUserData(data);
        
        // Remove the setParams call as we're now passing data directly via props
        // navigation.setParams({ userData: data });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (uid) fetchUserData();
  }, [uid]);

  return <Profile userData={userData} />;
};

const HomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Plates') iconName = focused ? 'car' : 'car-outline';
          else iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeContent} />
      <Tab.Screen name="Plates" component={PlateDetection} />
      <Tab.Screen name="Profile" component={ProfileWrapper} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  plate: {
    fontSize: 18,
    marginVertical: 5,
    color: 'green',
  },
});

export default HomeScreen;