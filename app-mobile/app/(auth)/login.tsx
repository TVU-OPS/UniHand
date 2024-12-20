import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Sử dụng icon từ thư viện Ionicons
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import userApi from "@/api/userApi";
import { UserLogin } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import supportOrganizationApi from "@/api/supportOrganization";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const colorScheme = useColorScheme();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    const request: UserLogin = {
      identifier: email,
      password,
    };
    try {
      const data = await userApi.login(request);
      await AsyncStorage.setItem("userInfo", JSON.stringify(data.user));
      await AsyncStorage.setItem("userAccessToken", data.jwt);
      Alert.alert("Thông báo", "Đăng nhập thành công");
      router.back();
    } catch (error) {
      Alert.alert("Thông báo", "Đăng nhập thất bại");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Image
          source={require("../../assets/images/Logo.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <ThemedText style={styles.title}>ĐĂNG NHẬP</ThemedText>
      <ThemedText style={styles.des}>
        Vui lòng điền thông tin để đăng nhập.
      </ThemedText>
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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <Link href={"/(auth)/register"} style={styles.link}>
        <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
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
    fontSize: 18,
    fontWeight: 500,
    color: "#4b5563",
    // marginBottom: 10,
    marginTop: 4,
    textAlign: "center",
  },
  image: {
    width: 80,
    height: 80,
    textAlign: "center",
  },
  des: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: 400,
    color: "#6b7280",
    marginBottom: 30,
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
    fontWeight: 500,
    marginLeft: 6, 
    color: "#6b7280",
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
    paddingVertical: 10,
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
