import React from "react";
import { Text, View ,Button,StyleSheet} from "react-native";
import { auth } from '../firebaseConfig'; // Import auth from the config

const user = auth.currentUser;
if (user) {
  console.log("User ID:", user.uid);  
} else {
  console.log("No user is signed in");
}
const HomeContent = () => (
  <View style={styles.centerContainer}>

    <Text style={styles.title}>Welcome to Zenpark {user ? `, ${user.uid}` : ""}</Text>

    <Button
      title="Scan QR Code"
      />
    <Button title="Pre Approve"/>
  </View>
);
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

export default HomeContent;