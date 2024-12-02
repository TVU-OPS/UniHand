import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Sử dụng icon từ thư viện Ionicons
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import userApi from "@/api/userApi";
import { UserLogin } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from 'expo-router';
import supportOrganizationApi from "@/api/supportOrganization";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const colorScheme = useColorScheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    const request : UserLogin = {
      identifier: email,
      password,
    };
    try {
      const data = await userApi.login(request);
      await AsyncStorage.setItem("userInfo",  JSON.stringify(data.user)); 
      await AsyncStorage.setItem("userAccessToken", data.jwt);
      Alert.alert("Thông báo", "Đăng nhập thành công");
      await fetchOrganization(data.user.id);
      router.back();
    } catch (error) {
      // console.error("Failed to login:", error);
      Alert.alert("Thông báo", "Đăng nhập thất bại");
    }
  };

  const fetchOrganization = async (userId: number) => {
    try {
      const data = await supportOrganizationApi.getSupportOrganizationByUserId(userId);
      await AsyncStorage.setItem("supportOrganizationInfo",  JSON.stringify(data.data[0])); 
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>ĐĂNG NHẬP</ThemedText>

      {/* Email */}
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          {/* Icon mail */}
          <Ionicons
            name="mail"
            size={20}
            color={colorScheme === "dark" ? "#fff" : "#888"}
          />
          <ThemedText style={styles.label}>Email</ThemedText>
        </View>
        <TextInput
          style={styles.input}
          placeholder="abc@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colorScheme === "dark" ? "#bbb" : "#888"} // Điều chỉnh màu placeholder
        />
      </View>

      {/* Password */}
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          {/* Icon lock */}
          <Ionicons
            name="lock-closed"
            size={20}
            color={colorScheme === "dark" ? "#fff" : "#888"}
          />
          <ThemedText style={styles.label}>Mật khẩu</ThemedText>
        </View>
        <TextInput
          style={styles.input}
          placeholder="point123"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colorScheme === "dark" ? "#bbb" : "#888"} // Điều chỉnh màu placeholder
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
    width: "100%",
  },
  labelContainer: {
    flexDirection: "row", // Đặt icon và label trên cùng một dòng
    alignItems: "center", // Căn giữa icon và label
    marginBottom: 5, // Khoảng cách giữa label và ô input
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6, // Khoảng cách giữa icon và label
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 23,
    fontSize: 16,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#50bef1",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    marginBottom: 10,
    alignItems: "center",
  },
  linkText: {
    color: "#50bef1",
    fontSize: 16,
  },
});
