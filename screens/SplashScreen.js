import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

const SplashScreen = () => (
  <View style={styles.container}>
    <Text>Loading...</Text>
    <ActivityIndicator />
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    resizeMode: 'contain',
  },
});

export default SplashScreen;
