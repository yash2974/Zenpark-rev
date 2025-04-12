import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

interface VehicleApproval {
  _id: string;
  uid: string;
  vehicle_number: string;
  rc_number: string;
  license_number: string;
  vehicle_type: string;
}

export default function VehicleApprovals() {
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<VehicleApproval[]>([]);

  const fetchApprovals = async () => {
    try {
      const response = await fetch("http://192.168.1.7:8001/unapproved-vehicles");
      const json = await response.json();
      setApprovals(json.vehicles || []);
      console.log("Vehicle approvals fetched:", json.vehicles);
    } catch (error) {
      console.error("Error fetching vehicle approvals:", error);
      Alert.alert("Error", "Failed to load vehicle approvals.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: string) => async () => {
    try {
      const response = await fetch(`http://192.168.1.7:8001/approve-vehicle/${id}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to approve vehicle");
        return;
      }

      Alert.alert("Success", "Vehicle approved successfully");
      fetchApprovals(); // refresh list
    } catch (error) {
      console.error("Vehicle approval error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleReject = (id: string) => async () => {
    try {
      const response = await fetch(`http://192.168.1.7:8001/reject-vehicle/${id}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to reject vehicle");
        return;
      }

      Alert.alert("Success", "Vehicle rejected successfully");
      fetchApprovals(); // refresh list
    } catch (error) {
      console.error("Vehicle rejection error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#00B8D4" />
      ) : approvals.length === 0 ? (
        <Text style={styles.noDataText}>No vehicle approvals pending</Text>
      ) : (
        <FlatList
          data={approvals}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>Vehicle No: {item.vehicle_number}</Text>
              <Text style={styles.text}>RC Number: {item.rc_number}</Text>
              <Text style={styles.text}>License: {item.license_number}</Text>
              <Text style={styles.text}>Type: {item.vehicle_type}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleApprove(item._id)}
                >
                  <Text style={styles.buttonText}>Approve</Text>
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
    backgroundColor: "#0A0F1F",
    padding: 16,
  },
  noDataText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
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
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
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
});
