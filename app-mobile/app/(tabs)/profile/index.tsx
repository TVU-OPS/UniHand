import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ThemedView } from "@/components/ThemedView";
import { SupportOrganization } from "@/types/supportOrganization";
import { User } from "@/types/user";
import { Link } from "expo-router";
import supportOrganizationApi from "@/api/supportOrganization";

export default function ProfileScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [organizationInfo, setOrganizationInfo] =
    useState<SupportOrganization | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchOrganization = async (userId: number) => {
    try {
      const data = await supportOrganizationApi.getSupportOrganizationByUserId(
        userId
      );
      if (data.data.length === 0) {
      }
      await AsyncStorage.setItem(
        "supportOrganizationInfo",
        JSON.stringify(data.data[0])
      );
      setOrganizationInfo(data.data[0]);
    } catch (error) {
      // console.error("Failed to fetch organization:", error);
    }
  };

  const handleSaveChanges = async () => {
    // Xử lý lưu thông tin chỉnh sửa
    try {
      if (userInfo) {
        await AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
      }
      if (organizationInfo) {
        await AsyncStorage.setItem(
          "supportOrganizationInfo",
          JSON.stringify(organizationInfo)
        );
      }
      setIsEditing(false); // Thoát chế độ chỉnh sửa
    } catch (error) {
      console.error("Failed to save changes", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const checkAccessToken = async () => {
        try {
          const userToken = await AsyncStorage.getItem("userAccessToken");
          const userInfo = await AsyncStorage.getItem("userInfo");
          const user = userInfo ? JSON.parse(userInfo) : null;
          setAccessToken(userToken);
          setUserInfo(user);
        } catch (error) {
          console.error("Failed to fetch data from AsyncStorage", error);
        }
      };

      checkAccessToken();
    }, [])
  );

  useEffect(() => {
    if (userInfo) fetchOrganization(userInfo?.id);
  }, [userInfo]);

  const handleLogout = () => {
    AsyncStorage.removeItem("userInfo");
    AsyncStorage.removeItem("userAccessToken");
    AsyncStorage.removeItem("supportOrganizationInfo");
    setUserInfo(null);
    setOrganizationInfo(null);
    setAccessToken(null);
  };

  return (
    <ThemedView style={styles.container}>
      {accessToken ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.header}>
            {organizationInfo == null
              ? "Thông tin tài khoản"
              : "Thông tin tổ chức"}
          </Text>
          {organizationInfo == null ? (
            <>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>Email:</Text>

                <Text style={styles.value}>{userInfo?.email}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>Tài khoản:</Text>

                <Text style={styles.value}>{userInfo?.username}</Text>
              </View>
              <Link href="/(auth)/registerOrganization" style={styles.button}>
                <Ionicons name="people" size={16} color="#fff" />
                <Text style={[styles.buttonText]}>
                  {" "}
                  Đăng ký tài khoản tổ chức
                </Text>
              </Link>
            </>
          ) : (
            <>
              <View style={styles.orgAvatarContainer}>
                <Image
                  source={{
                    uri:
                      `${process.env.EXPO_PUBLIC_API_URL}${organizationInfo?.Image?.[0]?.url}` ||
                      "https://via.placeholder.com/150",
                  }}
                  style={styles.orgAvatar}
                />
              </View>
              <View style={styles.editButtonContainer}>
                {isEditing && (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveChanges}
                  >
                    <Ionicons name="save" size={14} color="#fff" />
                    <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={16} color="#fff" />
                  <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={[
                    styles.editButton,
                    { backgroundColor: isEditing ? "#f87171" : "#50bef1" },
                  ]}
                  onPress={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <Ionicons name="close" size={16} color="#fff" />
                  ) : (
                    <Ionicons name="create-outline" size={16} color="#fff" />
                  )}
                  <Text style={[styles.editButtonText]}>
                    {isEditing ? "Hủy" : "Chỉnh sửa thông tin"}
                  </Text>
                </TouchableOpacity> */}
              </View>
              {/* Thông tin tổ chức */}
              <View style={styles.infoContainer}>
                <Text style={styles.label}>Tên tổ chức:</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={organizationInfo?.Name || ""}
                    onChangeText={(text) =>
                      setOrganizationInfo((prev) =>
                        prev ? { ...prev, Name: text } : prev
                      )
                    }
                  />
                ) : (
                  <Text style={styles.value}>{organizationInfo?.Name}</Text>
                )}
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>Trạng thái:</Text>
                <Text style={styles.value}>
                  {organizationInfo?.Confirmed == null ||
                  organizationInfo?.Confirmed == false
                    ? "Chưa xác thực"
                    : "Đã xác thực"}
                </Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>Đại diện:</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={organizationInfo?.Representative || ""}
                    onChangeText={(text) =>
                      setOrganizationInfo((prev) =>
                        prev ? { ...prev, Representative: text } : prev
                      )
                    }
                  />
                ) : (
                  <Text style={styles.value}>
                    {organizationInfo?.Representative}
                  </Text>
                )}
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>Email nhận thông báo:</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={organizationInfo?.NotificationEmail || ""}
                    onChangeText={(text) =>
                      setOrganizationInfo((prev) =>
                        prev ? { ...prev, NotificationEmail: text } : prev
                      )
                    }
                  />
                ) : (
                  <Text style={styles.value}>
                    {organizationInfo?.NotificationEmail}
                  </Text>
                )}
              </View>
              <View style={styles.infoContainer}>
                <Text numberOfLines={2} style={styles.label}>Địa chỉ:</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    // value={organizationInfo?. || ""}
                    onChangeText={(text) =>
                      setUserInfo((prev) =>
                        prev ? { ...prev, email: text } : prev
                      )
                    }
                  />
                ) : (
                  <Text style={styles.value}>
                    {organizationInfo?.Province?.FullName},{" "}
                    {organizationInfo?.District?.FullName},{" "}
                    {organizationInfo?.Ward?.FullName}
                  </Text>
                )}
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{userInfo?.email}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>Mô tả:</Text>
                <Text numberOfLines={3} style={styles.value}>{organizationInfo?.Description} Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit suscipit laudantium quibusdam. Nam, minima magnam similique nulla explicabo dolore quaerat eos consectetur, doloribus, earum illum beatae voluptas. Ipsam, harum cum.</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>Số điện thoại:</Text>
                <Text numberOfLines={3} style={styles.value}>{organizationInfo?.PhoneNumber}</Text>
              </View>
            </>
          )}
        </ScrollView>
      ) : (
        <>
          <Link href="/(auth)/login" style={styles.button}>
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </Link>
          <Text style={styles.orgText}>Vui lòng đăng nhập.</Text>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 2,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: "100%",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 40,
    // textTransform: "uppercase",
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
  content: {
    alignItems: "center",
    paddingBottom: 30,
    width: "100vw",
  },
  avatarContainer: {
    position: "absolute",
    top: 20,
    alignItems: "center",
    zIndex: 2,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#fff",
  },
  orgAvatarContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  orgAvatar: {
    width: 100,
    height: 100,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  infoContainer: {
    width: "100%",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    // borderWidth: 1,
    borderWidth: 1,
    backgroundColor: "#f9fafb",
    borderColor: "#fff",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: "#333",
    marginTop: 4,
  },
  editButtonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: "#50bef1",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 4,
  },
  logoutButton: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    backgroundColor: "#50bef1",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 4,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: "#333",
    marginTop: 4,
  },
  saveButton: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    backgroundColor: "#4ade80",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
