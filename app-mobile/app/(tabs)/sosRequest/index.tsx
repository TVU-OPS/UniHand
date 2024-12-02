import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Alert,
  Text,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons"; // Import icon library
import { Disaster } from "@/types/disaster";
import disasterApi from "@/api/disasterApi";
import DropDownPicker from "react-native-dropdown-picker";
import { CreateSosRequest } from "@/types/sos-request";
import sosRequestApi from "@/api/sosRequestApi";
import { ThemedView } from "@/components/ThemedView";
import { LogBox } from "react-native";
import { ThemedText } from "@/components/ThemedText";

export default function SOSScreen() {
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [peopleCount, setPeopleCount] = useState("");
  const [needWater, setNeedWater] = useState(false);
  const [needFood, setNeedFood] = useState(false);
  const [needMedical, setNeedMedical] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [address, setAddress] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [selectedDisaster, setSelectedDisaster] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Tắt cảnh báo về VirtualizedLists
  LogBox.ignoreLogs([
    "VirtualizedLists should never be nested inside plain ScrollViews",
  ]);

  const fetchDisasters = async () => {
    try {
      const res = await disasterApi.getDisasters();
      const disasterOptions = res.data.map((disaster: Disaster) => ({
        label: disaster.Name, // Assuming `name` is the disaster name
        value: disaster.id, // Assuming `id` is the disaster ID
      }));
      setDisasters(disasterOptions);
    } catch (error) {
      console.error(error);
    }
  };
  const getLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setLat(latitude);
      setLng(longitude);

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const { city, region, street, country } = reverseGeocode[0];
        const formattedAddress = `${street}, ${city}, ${region}, ${country}`;
        setAddress(formattedAddress);
      }

      setLoadingLocation(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch location.");
      setLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !fullName ||
      !phoneNumber ||
      !selectedDisaster ||
      !lat ||
      !lng ||
      !peopleCount
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc (*).");
      return;
    }

    const requestData: CreateSosRequest = {
      data: {
        FullName: fullName,
        RequestDescription: description,
        PeopleCount: parseInt(peopleCount),
        NeedWater: needWater,
        NeedFood: needFood,
        NeedMedical: needMedical,
        PhoneNumber: phoneNumber,
        Location: { lat, lng },
        Disaster: selectedDisaster,
      },
    };

    setIsSubmitting(true); // Bắt đầu quay vòng
    try {
      const response = await sosRequestApi.createSosRequest(requestData);
      Alert.alert(
        "Thành công",
        "Yêu cầu hỗ trợ của bạn đã được gửi đi. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể."
      );
      // Reset dữ liệu sau khi gửi thành công
      setFullName("");
      setDescription("");
      setPeopleCount("");
      setNeedWater(false);
      setNeedFood(false);
      setNeedMedical(false);
      setPhoneNumber("");
      setLat(null);
      setLng(null);
      setAddress("");
      setSelectedDisaster(null);
    } catch (error : any) {
      console.log(error?.response?.data || error);
      Alert.alert("Error", "Failed to send request.");
    } finally {
      setIsSubmitting(false); // Kết thúc quay vòng
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ThemedView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../../assets/images/Logo.png")}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            <ThemedText style={styles.header}>Yêu cầu hỗ trợ</ThemedText>
            <Text style={styles.textDes}>
              Vui lòng nhập một số thông tin bắt buộc (*) và một số thông tin
              cần thiết nếu có.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Họ và tên *"
              value={fullName}
              onChangeText={setFullName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại *"
              value={phoneNumber}
              keyboardType="phone-pad"
              onChangeText={setPhoneNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Số người cần hỗ trợ *"
              value={peopleCount}
              keyboardType="numeric"
              onChangeText={setPeopleCount}
            />

            <DropDownPicker
              open={openDropdown}
              value={selectedDisaster}
              items={disasters}
              setOpen={setOpenDropdown}
              setValue={setSelectedDisaster}
              placeholder="Chọn loại thảm họa *"
              style={styles.dropdown}
              placeholderStyle={{ color: "#9ca3af" }}
              dropDownContainerStyle={{ borderColor: "#ccc", marginTop: 10 }}
            />

            <TextInput
              style={styles.input}
              placeholder="Mô tả hiện trạng, nhu cầu"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Address and Pick Button */}
            <View style={styles.addressContainer}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <Text style={[address ? {} : { color: "#9ca3af" }]}>
                  {address || "Địa chỉ *"}
                </Text>
              </ScrollView>
              <TouchableOpacity
                style={styles.pickButton}
                onPress={getLocation}
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <ActivityIndicator size="small" color="#FF4D4D" />
                ) : (
                  <Ionicons name="location-sharp" size={25} color="#FF4D4D" />
                )}
              </TouchableOpacity>
            </View>

            {/* Switches for needs */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Đồ ăn</Text>
                <Switch value={needFood} onValueChange={setNeedFood} />
              </View>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Nước uống</Text>
                <Switch value={needWater} onValueChange={setNeedWater} />
              </View>
              <View
                style={[styles.switchContainer, { justifyContent: "flex-end" }]}
              >
                <Text style={styles.switchLabel}>Y tế</Text>
                <Switch value={needMedical} onValueChange={setNeedMedical} />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.customButton,
                isSubmitting && { backgroundColor: "#ccc" },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Gửi yêu cầu</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 50,
    paddingTop: 60,
    flexGrow: 1, // Make sure content takes full height
    // justifyContent: "center", // Center content vertically
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    // color: "#333",
    textAlign: "center",
    textTransform: "uppercase",
    // marginBottom: 16,
    marginTop: 12,
  },
  textDes: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 6,
    marginTop: 6,
    paddingHorizontal: 16,
  },
  image: {
    width: 90,
    height: 90,
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    height: 45,
  },

  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 5,
  },
  switchLabel: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: 600,
  },
  locationCard: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#FFF0F0",
    borderColor: "#FF4D4D",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF4D4D",
    textAlign: "center",
  },
  locationDetail: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  customButton: {
    backgroundColor: "#50bef1",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    height: 45,
  },
  pickButton: {
    transform: [{ translateX: 4 }],
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    // width: 40, // Đảm bảo kích thước cố định
    // height: 40,
  },

  inputAddress: {
    flex: 1,
    // paddingHorizontal: 12,
  },

  dropdown: {
    // marginVertical: 10,
    marginTop: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownList: {
    borderColor: "#ccc",
  },
});
