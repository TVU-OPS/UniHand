import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "Đăng nhập" }} />
      {/* <Stack.Screen name="register" options={{ title: "Đăng ký" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Quên mật khẩu" }} /> */}
    </Stack>
  );
}
