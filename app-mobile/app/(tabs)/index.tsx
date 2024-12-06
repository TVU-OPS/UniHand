import { Image, StyleSheet, Platform, View, Alert } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { WebView } from 'react-native-webview';
import Map from '@/components/Map';
import { Linking } from "react-native";
import { useEffect, useState } from 'react';
import { User } from '@/types/user';
import { SupportOrganization } from '@/types/supportOrganization';
import notificationApi from '@/api/notificationApi';
import { useFocusEffect } from 'expo-router';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '@/types/notification';
import { Disaster } from '@/types/disaster';
import disasterApi from '@/api/disasterApi';


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
