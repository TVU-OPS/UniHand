import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
import { Ionicons } from "@expo/vector-icons";
import sosRequestApi from "@/api/sosRequestApi";
import { Picker } from "@react-native-picker/picker";

const status = [
  { label: "Chưa hỗ trợ", value: null },
  { label: "Đang hỗ trợ", value: 0 },
  { label: "Đã hỗ trợ", value: 1 },
];

export default function SosRequestsScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [organizationInfo, setOrganizationInfo] =
    useState<SupportOrganization | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItem, setIsLoadingItem] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<{ label: string; value: number }[]>(status);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    number | null
  >(null);

  const [acceptedBy, setAcceptedBy] = useState<boolean | null>(null);
  const [state, setState] = useState<boolean | null>(null);

  const fetchNotifications = async () => {
    try {
      if (organizationInfo && accessToken) {
        const res = await notificationApi.getNotificationsBySupportOrganization(
          organizationInfo.id,
          accessToken,
          page,
          5,
          acceptedBy,
          state
        );
        setNotifications(res.data);
        setTotalPages(res.meta.pagination.pageCount);
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

  const handleAcceptSOSRequest = async (documentId: string) => {
    try {
      setIsLoading(true);
      setIsLoadingItem(documentId);
      if (organizationInfo && accessToken) {
        const res = await sosRequestApi.acceptSosRequest(
          organizationInfo.id,
          documentId,
          accessToken
        );
        fetchNotifications();
      }
    } catch (error: any) {
      console.log("Failed to accept SOS Request:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingItem(documentId);
    }
  };
  const handleDoneSOSRequest = async (documentId: string) => {
    try {
      setIsLoading(true);
      setIsLoadingItem(documentId);
      if (organizationInfo && accessToken) {
        const res = await sosRequestApi.doneSosRequest(
          organizationInfo.id,
          documentId,
          accessToken
        );
        fetchNotifications();
      }
    } catch (error: any) {
      console.log("Failed to accept SOS Request:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingItem(documentId);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(1, page - 1);
    const endPage = Math.min(totalPages, page + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pressable
          key={i}
          onPress={() => setPage(i)}
          style={[styles.pageButton, page === i && styles.activePageButton]}
        >
          <Text
            style={[
              page === i ? { color: "#fff" } : { color: "#52525b" },
              { fontWeight: 600 },
            ]}
          >
            {i}
          </Text>
        </Pressable>
      );
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
          style={styles.pageButton}
          disabled={page === 1}
        >
          <Ionicons name="chevron-back-outline" size={20} color="#a1a1aa" />
        </TouchableOpacity>
        {pages}
        <TouchableOpacity
          onPress={() =>
            setPage((prevPage) => Math.min(prevPage + 1, totalPages))
          }
          style={styles.pageButton}
          disabled={page === totalPages}
        >
          <Ionicons name="chevron-forward-outline" size={20} color="#a1a1aa" />
        </TouchableOpacity>
      </View>
    );
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
          if (!userToken || !user || !organization) {
            setAccessToken(null);
            setUserInfo(null);
            setOrganizationInfo(null);
            return;
          }
          setAccessToken(userToken);
          setUserInfo(user);
          setOrganizationInfo(organization);
        } catch (error) {
          console.log("Failed to fetch data from AsyncStorage", error);
        }
      };

      checkAccessToken();
    }, [])
  );
  const handleRequestPress = (sosRequest: Notification["SOSRequest"]) => {
    console.log("Yêu cầu SOS được chọn:", sosRequest);
  };

  useEffect(() => {
    setPage(1);
    setAcceptedBy(false);
    setState(null);
    setStatusFilter(status);
    setSelectedStatusFilter(null);
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (organizationInfo) {
      fetchNotifications();
    }
  }, [organizationInfo]);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [])
  );

  useEffect(() => {
    fetchNotifications();
  }, [page, acceptedBy, state]);

  useEffect(() => {
    if (selectedStatusFilter === null) {
      setPage(1);
      setAcceptedBy(false);
      setState(null);
    }
    if (selectedStatusFilter === 0) {
      setPage(1);
      setAcceptedBy(true);
      setState(false);
    }
    if (selectedStatusFilter === 1) {
      setPage(1);
      setAcceptedBy(true);
      setState(true);
    }
  }, [selectedStatusFilter]);

  return (
    <ThemedView style={styles.container}>
      {accessToken ? (
        <>
          <View style={styles.header}>
            <View
              style={[styles.pickerContainer, { width: "45%", marginTop: 14 }]}
            >
              <View>
                <Picker
                  selectedValue={selectedStatusFilter}
                  onValueChange={(itemValue) =>
                    setSelectedStatusFilter(itemValue)
                  }
                >
                  {statusFilter?.map((statusFilter) => (
                    <Picker.Item
                      key={statusFilter.value}
                      label={statusFilter.label}
                      value={statusFilter.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            {renderPagination()}
          </View>
          <SosRequestsList
            notifications={notifications}
            onPressRequest={handleRequestPress}
            handleAcceptSOSRequest={handleAcceptSOSRequest}
            isLoading={isLoading}
            isLoadingItem={isLoadingItem}
            handleDoneSOSRequest={handleDoneSOSRequest}
          />
        </>
      ) : (
        <>
          <Link href="/(auth)/login" style={styles.button}>
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </Link>
          <Text style={styles.orgText}>
            Chức năng chỉ dành cho tài khoản của tổ chức.
          </Text>
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
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  orgText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
    maxWidth: 200,
    textAlign: "center",
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

  // Pagination
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  pageButton: {
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 5,
    height: 40,
    width: 30,
    color: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  activePageButton: {
    backgroundColor: "#50bef1",
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    justifyContent: "center",
    height: 32,
    overflow: "hidden",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30,
  },
  placeholder: {
    color: "black",
  },
  inputAndroid: {
    fontSize: 12,
  },
});
