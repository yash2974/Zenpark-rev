import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button, TouchableOpacity,Image } from 'react-native';
import { signOut ,getAuth} from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { RootTabParamList } from './types'; // adjust the path
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';



type UserData = {
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any; // For any other fields in userData
};
type NavigationProp = BottomTabNavigationProp<RootTabParamList>;
const auth = getAuth();
const handleSignout = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
interface ProfileProps {
  userData: UserData | null;
}

const Profile: React.FC<ProfileProps> = ({ userData }) => {
  const navigation = useNavigation<NavigationProp>();

  console.log("User data in Profile component:", userData);
  // Show loading indicator while data is being fetched
  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Profile</Text>
      </View>
      
      {/* User basic information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        {/* Show name if available */}
        {userData.name && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{userData.name}</Text>
          </View>
        )}
        
        {/* Show email if available */}
        {userData.email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{userData.email}</Text>
          </View>
        )}
        
        {/* Show phone if available */}
        {userData.mobileNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{userData.mobileNumber}</Text>
          </View>
        )}
        
        {/* Show address if available */}
        {userData.organization && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Organization:</Text>
            <Text style={styles.infoValue}>{userData.organization}</Text>
          </View>
        )}

        {userData.registrationNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registration:</Text>
            <Text style={styles.infoValue}>{userData.registrationNumber}</Text>
          </View>
        )}

<View style={styles.section}>
  <Text style={styles.infoLabel}>Vehicle</Text>
  <Text style={styles.infoValue}>{userData.vehicle || 'Not added'}</Text>
  <View style={{ marginTop: 12 }}>
  <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddVehicle')}>
    <Text style={styles.buttonText}>Add Vehicle</Text>
  </TouchableOpacity>

  </View>
</View>

      </View>
      
      {/* You can add more sections for other user data */}
      {/* For example, if you have additional data like user preferences */}
      {/* 
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {userData.preferences && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Theme:</Text>
            <Text style={styles.infoValue}>{userData.preferences.theme}</Text>
          </View>
        )}
      </View>
      */}
      
      {/* No data message if all main fields are empty */}
      {!userData.name && !userData.email && !userData.phone && !userData.address && (
        <Text style={styles.noData}>No user data available</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleSignout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>

    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1F', // soft dark navy
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1F',
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#1E2A38',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  section: {
    backgroundColor: '#111827', // deep gray-blue
    marginVertical: 12,
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B8D4',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoRow: {
    marginBottom: 14,
  },
  infoLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  infoValue: {
    fontSize: 16,
    color: '#F0F9FF',
    fontWeight: '500',
  },
  noData: {
    textAlign: 'center',
    fontSize: 15,
    color: '#999999',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#00B8D4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#00B8D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
});



export default Profile;