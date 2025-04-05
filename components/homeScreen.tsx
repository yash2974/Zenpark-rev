import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeContent from './homeContent';
import Profile from './profile';
import HomeContentNonAdmin from './homeContentNonAdmin';
import PlateDetection from './plateDetection';
import UserHistory from './userHistory';

const Tab = createBottomTabNavigator();

type UserData = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  admin?: boolean;
  [key: string]: any;
};

const ProfileWrapper = ({ userData }: { userData: UserData | null }) => {
  return <Profile userData={userData} />;
};

const HomeScreen = ({ userData }: { userData: UserData | null }) => {
  console.log(userData?.admin)
  if ((userData?.admin)==false) {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = '';
  
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'History') iconName = focused ? 'car' : 'car-outline';
            else iconName = focused ? 'person' : 'person-outline';
  
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeContentNonAdmin} />
        <Tab.Screen name="History" component={UserHistory} />
        <Tab.Screen name="Profile">
          {() => <ProfileWrapper userData={userData} />}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }
  else{
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
      <Tab.Screen name="Profile">
        {() => <ProfileWrapper userData={userData} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
  }
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
