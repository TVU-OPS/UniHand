import React, { useState } from "react";
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

export default function ProfileScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [organizationInfo, setOrganizationInfo] =
    useState<SupportOrganization | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleLogout = () => {
    AsyncStorage.removeItem("userInfo");
    AsyncStorage.removeItem("userAccessToken");
    AsyncStorage.removeItem("supportOrganizationInfo");
    setAccessToken(null);
  };

  return (
    <ThemedView style={styles.container}>
      {accessToken ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.header}>Thông tin tổ chức</Text>
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
              style={[styles.editButton, { backgroundColor: isEditing ? "#f87171" : "#50bef1" }] }
              onPress={() => setIsEditing(!isEditing)}
            >
              {
                isEditing ? <Ionicons name="close" size={16} color="#fff" /> : <Ionicons name="create-outline" size={16} color="#fff" />
              }
              <Text style={[styles.editButtonText ]}>
                {isEditing ? "Hủy" : "Chỉnh sửa thông tin"}
              </Text>
            </TouchableOpacity>
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

          {/* Thông tin người dùng */}
          {/* <View style={styles.infoContainer}>
            <Text style={styles.label}>Tên tài khoản:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={userInfo?.username || ""}
                onChangeText={(text) =>
                  setUserInfo((prev) =>
                    prev ? { ...prev, username: text } : prev
                  )
                }
              />
            ) : (
              <Text style={styles.value}>{userInfo?.username}</Text>
            )}
          </View> */}
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Địa chỉ:</Text>
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
              <Text style={styles.value}>{organizationInfo?.Province?.FullName}, {organizationInfo?.District?.FullName}, {organizationInfo?.Ward?.FullName}</Text>
            )}
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Email:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={userInfo?.email || ""}
                onChangeText={(text) =>
                  setUserInfo((prev) =>
                    prev ? { ...prev, email: text } : prev
                  )
                }
              />
            ) : (
              <Text style={styles.value}>{userInfo?.email}</Text>
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={16} color="#fff" />
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </ScrollView>
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
    marginTop: 12,
    alignItems: "center",
  },
  orgAvatar: {
    width: 130,
    height: 130,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  infoContainer: {
    width: "100%",
    marginTop: 16,
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
    backgroundColor: "#f5f5f4",
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
    backgroundColor: "#9ca3af",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 20,
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
