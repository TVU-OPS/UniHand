import { Image, StyleSheet, Platform, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { WebView } from 'react-native-webview';
import Map, { SosRequest } from '@/components/Map';
import { Linking } from "react-native";


export default function HomeScreen() {

  // const sosRequests: SosRequest[] = [
  //   {
  //     id: 1,
  //     FullName: "John Doe",
  //     Location: { lat: 9.918968, lng: 106.33812354 },
  //   },
  //   {
  //     id: 2,
  //     FullName: "Jane Smith",
  //     Location: { lat: 16.4289446, lng: 106.335133 },
  //   },
  //   {
  //     id: 3,
  //     FullName: "Alice Johnson",
  //     Location: { lat: 16.4299446, lng: 107.3129033 },
  //   },
  // ];
 
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
