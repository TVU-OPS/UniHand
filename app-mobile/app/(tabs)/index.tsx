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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [organizationInfo, setOrganizationInfo] =
    useState<SupportOrganization | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [disasters, setDisasters] = useState<Disaster[]>([]);

  // Fetch ongoing disasters
  const fetchOngoingDisasters = async () => {
    try {
      const res = await disasterApi.getOngoingDisasters();
      setDisasters(res.data);
      console.log("Ongoing disasters:", res.data);
    } catch (error: any) {
      console.log("Failed to fetch ongoing disasters:", error);
    }
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      if (organizationInfo && accessToken) {
        const res = await notificationApi.getNotificationsBySupportOrganization(
          organizationInfo.id,
          accessToken
        );
        setNotifications(res.data);
      }
    } catch (error: any) {
      if(error.response.status === 403) {
        Alert.alert("Thông báo", "Bạn không có quyền truy cập chức năng này. Có thể do tổ chức của bạn chưa được duyệt.");
      }
      console.log("Failed to fetch notifications:", error);
    }
  };

  // Fetch data from AsyncStorage
  useFocusEffect(
    React.useCallback(() => {
      const checkAccessToken = async () => {
        try {
          const userToken = await AsyncStorage.getItem("userAccessToken");
          const userInfo = await AsyncStorage.getItem("userInfo");
          const organizationInfo = await AsyncStorage.getItem(
            "supportOrganizationInfo"
          );
          const organization = organizationInfo
            ? JSON.parse(organizationInfo)
            : null;
          const user = userInfo ? JSON.parse(userInfo) : null;
          setAccessToken(userToken);
          setUserInfo(user);
          setOrganizationInfo(organization);
        } catch (error) {
          console.error("Failed to fetch data from AsyncStorage", error);
        }
      };

      checkAccessToken();
    }, [])
  );

  useEffect(() => {
    if (organizationInfo) {
      fetchNotifications();
      fetchOngoingDisasters();
    }
  }, [organizationInfo]);
 
  return (
    <View style={styles.container}>
      <Map notification={notifications} disasters={disasters} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
