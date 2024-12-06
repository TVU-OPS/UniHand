import { Alert, StyleSheet, Text, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link, useFocusEffect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { SupportOrganization } from "@/types/supportOrganization";
import { User } from "@/types/user";
import { Notification } from "@/types/notification";
import notificationApi from "@/api/notificationApi";
import SosRequestsList from "@/components/Notification";

export default function SosRequestsScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [organizationInfo, setOrganizationInfo] =
    useState<SupportOrganization | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      if (organizationInfo && accessToken) {
        const res = await notificationApi.getNotificationsBySupportOrganization(
          organizationInfo.id,
          accessToken,
          false
        );
        setNotifications(res.data);
      }
    } catch (error: any) {
      if (error.response.status === 403) {
        Alert.alert(
          "Thông báo",
          "Bạn không có quyền truy cập chức năng này. Có thể do tổ chức của bạn chưa được duyệt."
        );
      }
      console.log("Failed to fetch notifications:", error);
    }
  };

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
  const handleRequestPress = (sosRequest: Notification["SOSRequest"]) => {
    console.log("Yêu cầu SOS được chọn:", sosRequest);
  };

  useEffect(() => {
    if (organizationInfo) {
      fetchNotifications();
    }
  }, [organizationInfo]);

  return (
    <ThemedView style={styles.container}>
      {accessToken ? (
        <>
          {/* <View style={styles.containerHeader}>
            <Text style={styles.header}>Danh sách yêu cầu hỗ trợ</Text>
          </View> */}
          <SosRequestsList
            notifications={notifications}
            onPressRequest={handleRequestPress}
          />
        </>
      ) : (
        <>
          <Link href="/(auth)/login" style={styles.button}>
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </Link>
          <Text style={styles.orgText}>Chức năng chỉ dành cho tổ chức.</Text>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    // backgroundColor: "#ccc",
  },
  containerHeader: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 10,
  },
  orgText: {
    marginTop: 20,
    fontSize: 16,
    color: "#6b7280",
  },
  button: {
    backgroundColor: "#50bef1",
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
