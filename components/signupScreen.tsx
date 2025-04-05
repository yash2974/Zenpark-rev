import React from "react";
import { Text, View, Button, StyleSheet, Alert, TextInput } from "react-native";

export default function SignupScreen() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [Name, setName] = React.useState("");
    const [Organization, setOrganization] = React.useState("");
    const [RegistrationNumber, setRegistrationNumber] = React.useState("");
    const [MobileNumber, setMobileNumber] = React.useState("");


    const handleSignUp = async () => {
        console.log("Sign Up button pressed");
        // need to send all the data to mongodb
        if (!email || !password || !Name || !Organization || !RegistrationNumber || !MobileNumber) {
            Alert.alert("Error", "All fields are required!");
            return;
          }

        try {
            
            const response = await fetch("http://192.168.1.6:8001/register",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: Name,
                    organization: Organization,
                    registrationNumber: RegistrationNumber,
                    mobileNumber: MobileNumber,
                    email,
                    password,
                }),

            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert("Success", "user information sent successfully!");
            } else {
                Alert.alert("Error", data.message || "Something went wrong!");
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "Failed to send data to the server.");
        }
    };

  return (
          <View style={styles.container}>
            <Text style={styles.title}>Create a account</Text>
            <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={Name}
                    onChangeText={setName}
                    keyboardType="default"
                    autoCapitalize="none"
            />
            <TextInput
                    style={styles.input}
                    placeholder="Organization Name"
                    value={Organization}
                    onChangeText={setOrganization}
                    keyboardType="default"
                    autoCapitalize="none"
            />
            <TextInput
                    style={styles.input}
                    placeholder="Registration Number"
                    value={RegistrationNumber}
                    onChangeText={setRegistrationNumber}
                    keyboardType="numeric"
                    autoCapitalize="none"
            />
            <TextInput
                    style={styles.input}
                    placeholder="Mobile Number"
                    value={MobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="number-pad"
                    autoCapitalize="none"
            />
            <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
            />
              <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
            />
              <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
            />
              
              <Button title="Send data for verification" onPress={handleSignUp} />
          </View>
      );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
});