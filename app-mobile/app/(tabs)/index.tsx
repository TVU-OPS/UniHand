import { Image, StyleSheet, Platform, View, Alert } from 'react-native';

import Map from '@/components/Map';
import React from 'react';



export default function HomeScreen() {
 
  return (
    <View style={styles.container}>
      <Map  />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
