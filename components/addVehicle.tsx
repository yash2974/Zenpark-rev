import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AddVehicle = () => {
  const navigation = useNavigation();

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const handleSubmit = () => {
    console.log({
      vehicleNumber,
      rcNumber,
      licenseNumber,
      vehicleType
    });
    // You can add backend call here
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Vehicle</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. DL01AB1234"
          placeholderTextColor="#999"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>RC Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter RC Number"
          placeholderTextColor="#999"
          value={rcNumber}
          onChangeText={setRcNumber}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Driver’s License</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter License Number"
          placeholderTextColor="#999"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Bike, Car, Truck"
          placeholderTextColor="#999"
          value={vehicleType}
          onChangeText={setVehicleType}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save Vehicle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1F',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#00B8D4',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
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

export default AddVehicle;
