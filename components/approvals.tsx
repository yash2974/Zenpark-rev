import React, {  useEffect } from "react";
import { Button, View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";

interface Approval {
  _id: string;
  name: string;
  email: string;
  organization: string;
  contact: string;
  registration: string;
}




export default function Approvals() {
  
const [loading, setLoading] = React.useState(true);
const [approvals, setApprovals] = React.useState<Approval[]>([]);

const fetchApprovals = async () => {
  try {
    const response = await fetch("http://192.168.1.6:8001/pending-approvals?page=1&limit=10");
    const json = await response.json();
    setApprovals(json.approvals);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching approvals:", error);
  }
  
};

const handleAccept = (id: string) => async () => {
  try {
    const response = await fetch(`http://192.168.1.6:8001/approve/${id}`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      Alert.alert("Error", errorData.detail || "Failed to approve user");
      return;
    }

    Alert.alert("Success", "User approved successfully");
    fetchApprovals(); // refresh list
  } catch (error) {
    console.error("Approval error:", error);
    Alert.alert("Error", "Something went wrong");
  }


};

const handleReject = (id: string) => async () => {
  try {
    const response = await fetch(`http://192.168.1.6:8001/reject/${id}`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      Alert.alert("Error", errorData.detail || "Failed to reject user");
      return;
    }

    Alert.alert("Success", "User rejected successfully");
    fetchApprovals(); // refresh list
  } catch (error) {
    console.error("Approval error:", error);
    Alert.alert("Error", "Something went wrong");
  }


};

  
  useEffect(() => {
    fetchApprovals();  
  },[]);

  console.log("State Approvals:", approvals);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : approvals.length === 0 ? (
        <Text>No approvals found.</Text>
      ) : (
        <FlatList
          data={approvals}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>Email: {item.email}</Text>
              <Text>Contact: {item.contact}</Text>
              <Text>Organization: {item.organization}</Text>
              <Text>Registration: {item.registration}</Text>
  
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleAccept(item._id)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={handleReject(item._id)}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshing={loading}
          onRefresh={fetchApprovals} 
        />
      )}
    </View>
  );
  
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f2f2f2",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  rejectButton: {
    backgroundColor: "#F44336",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
