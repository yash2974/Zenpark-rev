import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const HomeContentNonAdmin = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../images/dark.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome to Zenpark</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});

export default HomeContentNonAdmin;
