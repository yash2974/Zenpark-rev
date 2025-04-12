import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

interface PlateData {
  plate: string;
  confidence: number;
  timestamp: string;
}

const PlateDetection = () => {
  const [plates, setPlates] = useState<PlateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  // WebSocket connection
  const WS_URL = "ws://192.168.1.7:8003/ws"; // Update with your WebSocket server address
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Connect to WebSocket and handle messages
  const connectWebSocket = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    
    try {
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log("✅ Connected to WebSocket server");
        setConnected(true);
        
        // If we're reconnecting and already have plates, request a refresh
        if (plates.length > 0 && !initializing) {
          socket.send(JSON.stringify({ action: "refresh" }));
        }
      };
      
      socket.onclose = (event) => {
        console.log("🔌 WebSocket disconnected:", event.code, event.reason);
        setConnected(false);
        
        // Schedule reconnection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect...");
          connectWebSocket();
        }, 3000);
      };
      
      socket.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case "plate_data":
              // Individual plate data
              handlePlateData(message.data);
              break;
              
            case "new_plate":
              // New plate detected
              handleNewPlate(message.data);
              break;
              
            case "initialization_complete":
              // Initial data load completed
              console.log(`✅ Initialization complete. Loaded ${message.count} plates.`);
              setLoading(false);
              setInitializing(false);
              break;
              
            case "refresh_start":
              // Refresh operation started
              console.log(`🔄 Starting refresh for ${message.count} plates`);
              setRefreshing(true);
              setPlates([]);  // Clear existing plates for refresh
              break;
              
            case "refresh_complete":
              // Refresh operation completed
              console.log("✅ Refresh complete");
              setRefreshing(false);
              break;
              
            default:
              console.log("Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    } catch (error) {
      console.error("Failed to connect:", error);
      // Schedule reconnection
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  };
  
  // Handle individual plate data (during initialization or refresh)
  const handlePlateData = (plate: PlateData) => {
    setPlates(prev => {
      // Check if this plate already exists in our list
      const existingIndex = prev.findIndex(p => p.plate === plate.plate);
      
      if (existingIndex >= 0) {
        // If it exists but has a different timestamp, update it
        if (prev[existingIndex].timestamp !== plate.timestamp) {
          const updated = [...prev];
          updated[existingIndex] = plate;
          return updated;
        }
        return prev;
      } else {
        // Add to end during initialization (will be sorted by timestamp)
        return [plate, ...prev];  // ✅ adds newest first

      }
    });
  };
  
  // Handle newly detected plate
  const handleNewPlate = (plate: PlateData) => {
    setPlates(prev => {
      // Check if this plate already exists in our list
      const existingIndex = prev.findIndex(p => p.plate === plate.plate);
      
      if (existingIndex >= 0) {
        // If it exists but has a different timestamp, update it
        if (prev[existingIndex].timestamp !== plate.timestamp) {
          const updated = [...prev];
          updated[existingIndex] = plate;
          return updated;
        }
        return prev;
      } else {
        // Add new plate to the beginning
        return [plate, ...prev];  // ✅ adds newest first

      }
    });
  };
  
  // Manual refresh function
  const onRefresh = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: "refresh" }));
    } else {
      Alert.alert("Not Connected", "Cannot refresh while disconnected from server");
      connectWebSocket();
    }
  };
  
  // Initialize connection
  useEffect(() => {
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
  
  // Format the timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Plate Detection</Text>
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: connected ? "#4CAF50" : "#F44336" }
        ]} />
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing || !connected}
        >
          <Text style={styles.refreshButtonText}>
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#66fcf1" />
          <Text style={styles.loadingText}>Loading plates...</Text>
        </View>
      ) : (
        <>
          {!connected && (
            <View style={styles.disconnectedBanner}>
              <Text style={styles.disconnectedText}>
                Disconnected from server. Reconnecting...
              </Text>
            </View>
          )}
          
          <FlatList
            data={plates}
            keyExtractor={(item, index) => `${item.plate}-${index}`}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {refreshing 
                  ? "Refreshing data..." 
                  : "No plates detected yet."}
              </Text>
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.infoBox}>
                  <Text style={styles.plate}>{item.plate}</Text>
                  <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                </View>
                <Text style={styles.confidence}>
                  {Math.round(item.confidence * 100)}%
                </Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0c10",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    color: "#66fcf1",
    fontWeight: "bold",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  controls: {
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: "#45a29e",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#c5c6c7",
    fontSize: 16,
  },
  disconnectedBanner: {
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  disconnectedText: {
    color: "#F44336",
    textAlign: "center",
  },
  empty: {
    color: "#c5c6c7",
    textAlign: "center",
    marginTop: 20,
  },
  row: {
    backgroundColor: "#1f2833",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderColor: "#45a29e",
    borderWidth: 1,
    marginBottom: 10,
  },
  infoBox: {
    flexDirection: "column",
  },
  plate: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 14,
    color: "#c5c6c7",
    marginTop: 4,
  },
  confidence: {
    fontSize: 16,
    color: "#45a29e",
  },
});

export default PlateDetection;