import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

type UserData = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: any; // For any other fields in userData
};

const Profile = () => {
  const route = useRoute();
  const userData = route.params?.userData as UserData || {};

  const renderUserInfo = () => {
    if (!userData || Object.keys(userData).length === 0) {
      return <Text style={styles.noData}>No user data available</Text>;
    }

    return Object.entries(userData).map(([key, value]) => {
      // Skip rendering null, undefined or empty values
      if (value === null || value === undefined || value === '') return null;
      
      // Format the key for display (capitalize first letter)
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
      
      return (
        <View style={styles.infoRow} key={key}>
          <Text style={styles.infoLabel}>{formattedKey}:</Text>
          <Text style={styles.infoValue}>{String(value)}</Text>
        </View>
      );
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Profile</Text>
      </View>
      <View style={styles.userInfoContainer}>
        {renderUserInfo()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  userInfoContainer: {
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