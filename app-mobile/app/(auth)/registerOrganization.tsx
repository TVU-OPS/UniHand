import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Sử dụng icon từ thư viện Ionicons
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import supportOrganizationApi from "@/api/supportOrganization";
import { SupportOrganizationCreate } from "@/types/supportOrganization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router, useFocusEffect } from "expo-router";
import provinceApi from "@/api/provinceApi";
import districtApi from "@/api/district";
import wardApi from "@/api/ward";
import { District } from "@/types/district";
import { Province } from "@/types/province";
import { Ward } from "@/types/ward";
import * as ImagePicker from "expo-image-picker";
import uploadApi from "@/api/upload";
import { User } from "@/types/user";
import { Picker } from "@react-native-picker/picker";

export default function RegisterOrganizationScreen() {
  const [name, setName] = useState("");
  const [representative, setRepresentative] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [image, setImage] = useState<number[]>([]);
  const [province, setProvince] = useState<number | null>(null);
  const [district, setDistrict] = useState<number | null>(null);
  const [ward, setWard] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const colorScheme = useColorScheme();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  // Dropdown for provinces
  const [provinces, setProvinces] =
    useState<{ label: string; value: number }[]>();
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);

  // Dropdown for districts
  const [districts, setDistricts] =
    useState<{ label: string; value: number }[]>();
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  // Dropdown for wards
  const [wards, setWards] = useState<{ label: string; value: number }[]>();
  const [selectedWard, setSelectedWard] = useState<number | null>(null);

  // Image state
  const [images, setImages] = useState<string[] | null[]>([null]);

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

  const handleRegister = async () => {
    if (!userInfo) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập trước khi đăng ký tổ chức");
      return;
    }
    if (
      !name ||
      !representative ||
      !notificationEmail ||
      !phoneNumber ||
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard ||
      !selectedWard ||
      !description
    ) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    const request: SupportOrganizationCreate = {
      data: {
        Name: name,
        Representative: representative,
        NotificationEmail: notificationEmail,
        Image: [],
        user: userInfo!.id,
        Province: selectedProvince!,
        District: selectedDistrict!,
        Ward: selectedWard!,
        Description: description,
        PhoneNumber: phoneNumber,
      },
    };
    let imageIds = [];
    const imageUrl = images.filter((image) => image !== null);
    if (imageUrl.length == 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ảnh đại diện");
      return;
    }
    try {
      if (imageUrl?.length > 0) {
        const res = await uploadApi.uploadImageFiles(imageUrl);
        imageIds = res.map((file) => file.id);
        request.data.Image = imageIds;
      }
      const res = await supportOrganizationApi.createSupportOrganization(
        request
      );
      await AsyncStorage.setItem("organizationInfo", JSON.stringify(res.data));
      Alert.alert("Thông báo", "Đăng ký tổ chức thành công");
      router.back();
    } catch (error) {
      Alert.alert("Thông báo", "Đăng ký tổ chức thất bại");
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await provinceApi.getProvinces();
      const provinceOptions = res.data.map((province: Province) => ({
        label: province.FullName,
        value: province.id,
      }));
      setProvinces(provinceOptions);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDistricts = async () => {
    if (!selectedProvince) {
      return;
    }
    try {
      const res = await districtApi.getDistrictsByProvinceId(
        selectedProvince.toString()
      );
      const districtOptions = res.data.map((district: District) => ({
        label: district.FullName,
        value: district.id,
      }));
      setDistricts(districtOptions);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWards = async () => {
    if (!selectedDistrict) {
      return;
    }
    try {
      const res = await wardApi.getWardsByDistrictId(
        selectedDistrict.toString()
      );
      const wardOptions = res.data.map((ward: Ward) => ({
        label: ward.FullName,
        value: ward.id,
      }));
      setWards(wardOptions);
    } catch (error) {
      console.error(error);
    }
  };

  const pickImage = async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0].uri;

        // Thay thế ảnh tại vị trí index
        const newImages = [...images];
        newImages[index] = selectedImage;
        setImages(newImages);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh, vui lòng thử lại!");
      console.error(error);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  useEffect(() => {
    fetchDistricts();
    setWards([]);
  }, [selectedProvince]);

  useEffect(() => {
    fetchWards();
  }, [selectedDistrict]);

  useEffect(() => {
    fetchProvinces();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
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
        <ThemedText style={styles.title}>ĐĂNG KÝ TỔ CHỨC</ThemedText>
        <ThemedText style={styles.des}>
          Vui lòng điền thông tin của tổ chức bạn muốn đăng ký.
        </ThemedText>
        {/* Name */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Ionicons
              name="business"
              size={20}
              color={colorScheme === "dark" ? "#fff" : "#888"}
            />
            <ThemedText style={styles.label}>Tên tổ chức</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Tổ chức ABC"
            value={name}
            onChangeText={setName}
            keyboardType="default"
            autoCapitalize="none"
            placeholderTextColor={colorScheme === "dark" ? "#bbb" : "#888"}
          />
        </View>

        {/* Representative */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Ionicons
              name="person"
              size={20}
              color={colorScheme === "dark" ? "#fff" : "#888"}
            />
            <ThemedText style={styles.label}>Người đại diện</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Nguyễn Văn A"
            value={representative}
            onChangeText={setRepresentative}
            keyboardType="default"
            autoCapitalize="none"
            placeholderTextColor={colorScheme === "dark" ? "#bbb" : "#888"}
          />
        </View>

        {/* Notification Email */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Ionicons
              name="mail"
              size={20}
              color={colorScheme === "dark" ? "#fff" : "#888"}
            />
            <ThemedText style={styles.label}>Email thông báo</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            placeholder="organization@gmail.com"
            value={notificationEmail}
            onChangeText={setNotificationEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colorScheme === "dark" ? "#bbb" : "#888"}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Ionicons
              name="call"
              size={20}
              color={colorScheme === "dark" ? "#fff" : "#888"}
            />
            <ThemedText style={styles.label}>Số điện thoại</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            placeholder="0920399**"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoCapitalize="none"
            placeholderTextColor={colorScheme === "dark" ? "#bbb" : "#888"}
          />
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colorScheme === "dark" ? "#fff" : "#888"}
            />
            <ThemedText style={styles.label}>Mô tả</ThemedText>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Mô tả"
            value={description}
            onChangeText={setDescription}
            keyboardType="default"
            autoCapitalize="none"
            placeholderTextColor={colorScheme === "dark" ? "#bbb" : "#888"}
          />
        </View>
        <View style={styles.labelContainer}>
            <Ionicons
              name="location"
              size={20}
              color={colorScheme === "dark" ? "#fff" : "#888"}
            />
            <ThemedText style={styles.label}>Tỉnh / Thành phố</ThemedText>
          </View>
        <View
          style={{
            borderColor: "#ddd",
            borderWidth: 1,
            borderRadius: 8,
            marginTop: 8,
            marginBottom: 8,
            // paddingHorizontal: 12,
            backgroundColor: "#fff",
            height: 44,
            fontSize: 16,
            justifyContent: "center",
          }}
        >
          <Picker
            selectedValue={selectedProvince}
            onValueChange={(itemValue) => setSelectedProvince(itemValue)}
          >
            {provinces?.map((ward) => (
              <Picker.Item
                key={ward.value}
                label={ward.label}
                value={ward.value}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.labelContainer}>
            <Ionicons
              name="location"
              size={20}
              color={colorScheme === "dark" ? "#fff" : "#888"}
            />
            <ThemedText style={styles.label}>Quận / Huyện</ThemedText>
          </View>
        <View
          style={{
            borderColor: "#ddd",
            borderWidth: 1,
            borderRadius: 8,
            marginTop: 8,
            marginBottom: 8,
            // paddingHorizontal: 12,
            backgroundColor: "#fff",
            height: 44,
            fontSize: 16,
            justifyContent: "center",
          }}
        >
          <Picker
            selectedValue={selectedDistrict}
            onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
          >
            {districts?.map((district) => (
              <Picker.Item
                key={district.value}
                label={district.label}
                value={district.value}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.labelContainer}>
            <Ionicons
              name="location"
              size={20}
              color={colorScheme === "dark" ? "#fff" : "#888"}
            />
            <ThemedText style={styles.label}>Quận / Huyện</ThemedText>
          </View>
        <View
          style={{
            borderColor: "#ddd",
            borderWidth: 1,
            borderRadius: 8,
            marginTop: 8,
            marginBottom: 8,
            // paddingHorizontal: 12,
            backgroundColor: "#fff",
            height: 44,
            fontSize: 16,
            justifyContent: "center",
          }}
        >
          <Picker
            selectedValue={selectedWard}
            onValueChange={(itemValue) => setSelectedWard(itemValue)}
          >
            {wards?.map((ward) => (
              <Picker.Item
                key={ward.value}
                label={ward.label}
                value={ward.value}
              />
            ))}
          </Picker>
        </View>

        {/* Image Picker */}
        <View style={[styles.labelContainer, { marginTop: 14 }]}>
          <Ionicons
            name="image"
            size={20}
            color={colorScheme === "dark" ? "#fff" : "#888"}
          />
          <ThemedText style={styles.label}>Ảnh đại diện</ThemedText>
        </View>

        <View style={styles.grid}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              {image ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.imagePick} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeButtonText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => pickImage(index)}
                  style={styles.placeholder}
                >
                  <Ionicons name="image-outline" size={25} color="#ccc" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>

        <Link href={"/(auth)/login"} style={styles.link}>
          <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
        </Link>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
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
    color: "#4b5563",
    marginBottom: 10,
  },
  scrollContainer: {
    // padding: 10,
    // paddingBottom: 10,
    // paddingTop: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 500,
    color: "#4b5563",
    // marginBottom: 10,
    marginTop: 10,
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
    fontWeight: 500,
    marginLeft: 6, // Khoảng cách giữa icon và label
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
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
    marginTop: 16,
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

  pickerContainer: {
    paddingRight: 5,
    borderWidth: 0.8,
    borderColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    height: 40,
    overflow: "hidden",
  },

  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageWrapper: {
    width: "22%",
    height: 70,
    margin: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    position: "relative",
  },
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  imagePick: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9ecef",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 12,
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
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  placeholder: {
    color: "#9ca3af",
  },
  inputAndroid: {
    fontSize: 12,
  },
});
