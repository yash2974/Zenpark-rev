import React, {  useEffect } from "react";
import { Button, View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";

interface Approval {
  _id: string;
  name: string;
  email: string;
  organization: string;
  mobileNumber: string;
  registrationNumber: string;
}




export default function Approvals() {
  
const [loading, setLoading] = React.useState(true);
const [approvals, setApprovals] = React.useState<Approval[]>([]);

const fetchApprovals = async () => {
  try {
    const response = await fetch("http://192.168.1.7:8001/pending-approvals?page=1&limit=10");
    const json = await response.json();
    setApprovals(json.approvals);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching approvals:", error);
  }
  
};

const handleAccept = (id: string) => async () => {
  try {
    const response = await fetch(`http://192.168.1.7:8001/approve/${id}`, {
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
    const response = await fetch(`http://192.168.1.7:8001/reject/${id}`, {
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
        <Text style={styles.noDataText}>No approvals found</Text>

      ) : (
        <FlatList
          data={approvals}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.text}>{item.name}</Text>
              <Text style={styles.text}>Email: {item.email}</Text>
              <Text style={styles.text}>Contact: {item.mobileNumber}</Text>
              <Text style={styles.text}>Organization: {item.organization}</Text>
              <Text style={styles.text}>Registration: {item.registrationNumber}</Text>
  
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
    backgroundColor: "#0A0F1F",
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
  },
  text: {
    color: "#CCCCCC",
    fontSize: 15,
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  acceptButton: {
    backgroundColor: "#00B8D4",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#00B8D4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  rejectButton: {
    backgroundColor: "#F44336",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#F44336",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  noDataText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    opacity: 0.8,
  },
  
});
