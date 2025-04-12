import React from "react";
import { Text, View, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from "react-native";
import { auth } from '../firebaseConfig';

const user = auth.currentUser;
if (user) {
  console.log("User ID:", user.uid);  
} else {
  console.log("No user is signed in");
}

export default function HomeContent({ navigation }: { navigation: any }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentWrapper}>
      <Image source={require('../images/image.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to Zenpark</Text>

      <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Scan QR Code", "This feature is not yet implemented.")}> 
        <Text style={styles.buttonText}>Scan QR Code</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('VehicleApprovals')}>
        <Text style={styles.buttonText}>Vehicle Approvals</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Approvals')}>
        <Text style={styles.buttonText}>User Approvals</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1F',
    paddingHorizontal: 16,
  },
  contentWrapper: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 0,
    marginTop: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#00B8D4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
    width: '80%',
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
