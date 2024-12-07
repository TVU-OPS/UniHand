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
import { UserLogin, UserRegister } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import supportOrganizationApi from "@/api/supportOrganization";

export default function RegisterScreen() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const colorScheme = useColorScheme();

  const handleLogin = async () => {
    if (!userName || !email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    const request: UserRegister = {
      username: userName,
      email: email,
      password: password,
    };
    try {
      const data = await userApi.register(request);
      await AsyncStorage.setItem("userInfo", JSON.stringify(data.user));
      await AsyncStorage.setItem("userAccessToken", data.jwt);
      Alert.alert("Thông báo", "Đăng ký thành công");
      router.back();
    } catch (error) {
      Alert.alert("Thông báo", "Đăng ký thất bại");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Đăng Ký</ThemedText>

      {/* Username */}
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          {/* Icon user */}
          <Ionicons
            name="person"
            size={20}
            color={colorScheme === "dark" ? "#fff" : "#888"}
          />
          <ThemedText style={styles.label}>Tên người dùng</ThemedText>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nguyen Van A"
          value={userName}
          onChangeText={setUserName}
          keyboardType="default"
          autoCapitalize="none"
          placeholderTextColor={colorScheme === "dark" ? "#bbb" : "#888"} // Điều chỉnh màu placeholder
        />
      </View>

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
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>

      <Link href={"/(auth)/login"} style={styles.link}>
        <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
      </Link>
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
    marginBottom: 12,
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
    textAlign: "center",
  },
  linkText: {
    color: "#50bef1",
    fontSize: 16,
  },
});
