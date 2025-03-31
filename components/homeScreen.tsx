import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, FlatList, StyleSheet, ActivityIndicator ,Button} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Profile from './profile';
import HomeContent from './homeContent';

// Home Screen


// Plate Detection Screen
const PlateDetection = () => {
  const [plates, setPlates] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const socket = new WebSocket('ws://192.168.1.6:8000/ws');

    socket.onopen = () => {
      console.log('Connected to FastAPI WebSocket');
      setLoading(false);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Handle single plate detection
      if (data.plate) {
        setPlates((prevPlates) => [...new Set([data.plate, ...prevPlates])]); // Avoid duplicates
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

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

// Create Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Home Screen with Bottom Tab Navigation
const HomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Plates') {
            iconName = focused ? 'car' : 'car-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen name="Home" component={HomeContent} />
      <Tab.Screen name="Plates" component={PlateDetection} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f5f5' 
  },
  centerContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  plate: { 
    fontSize: 18, 
    marginVertical: 5, 
    color: 'green' 
  }
});

export default HomeScreen;