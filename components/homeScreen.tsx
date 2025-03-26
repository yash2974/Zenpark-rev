import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

const PlateDetection = () => {
  const [plates, setPlates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = new WebSocket('ws://192.168.1.6:8000/ws');

    socket.onopen = () => {
      console.log('Connected to FastAPI WebSocket');
      setLoading(false);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPlates(data.plates);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => socket.close();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detected Plates:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={plates}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={<Text>No plates detected</Text>}
          renderItem={({ item }) => <Text style={styles.plate}>{item}</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  plate: { fontSize: 18, marginVertical: 5, color: 'green' }
});

export default PlateDetection;
