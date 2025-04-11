import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button } from 'react-native';
import { signOut ,getAuth} from 'firebase/auth';

type UserData = {
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any; // For any other fields in userData
};

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

        {userData.vehicle && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle:</Text>
            <Text style={styles.infoValue}>{userData.vehicle}</Text>
          </View>
        )}
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
      <Button title="Log Out" onPress={handleSignout}/>
    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontWeight: 'bold',
    width: '30%',
    fontSize: 16,
  },
  infoValue: {
    width: '70%',
    fontSize: 16,
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    padding: 20,
  },
});

export default Profile;