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
import { CreateSosRequest } from "@/types/sos-request";
import sosRequestApi from "@/api/sosRequestApi";
import { ThemedView } from "@/components/ThemedView";
import { LogBox } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Link, useFocusEffect } from "expo-router";
import locationApi from "@/api/locationApi";
import provinceApi from "@/api/provinceApi";
import { Province } from "@/types/province";
import districtApi from "@/api/district";
import { District } from "@/types/district";
import { Ward } from "@/types/ward";
import wardApi from "@/api/ward";
import RNPickerSelect from "react-native-picker-select";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import uploadApi from "@/api/upload";

export default function SOSScreen() {
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [needWater, setNeedWater] = useState(false);
  const [needFood, setNeedFood] = useState(false);
  const [needMedical, setNeedMedical] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [lat, setLat] = useState<string | null>(null);
  const [lng, setLng] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[] | null[]>([
    null,
    null,
    null,
    null,
  ]);

  // Audio recording
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Dropdown for disasters
  const [disasters, setDisasters] =
    useState<{ label: string; value: number }[]>();
  const [selectedDisaster, setSelectedDisaster] = useState<number | null>(null);

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

  // Extra address details
  const [road, setRoad] = useState<string | null>(null);
  const [amenity, setAmenity] = useState<string | null>(null);
  const [addressDetail, setAddressDetail] = useState<string | null>(null);

  // Accordion state
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedAdress, setExpandedAdress] = useState(false);
  const heightValue = useSharedValue(0);
  const heightValueAdress = useSharedValue(0);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
    heightValue.value = isExpanded ? 0 : 240; 
  };

  const toggleAccordionAdress = () => {
    setExpandedAdress(!isExpandedAdress);
    heightValueAdress.value = isExpandedAdress ? 0 : 110; 
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(heightValue.value, { duration: 300 }),
    overflow: "hidden",
  }));

  const animatedStyleAdress = useAnimatedStyle(() => ({
    height: withTiming(heightValueAdress.value, { duration: 300 }),
    overflow: "hidden",
  }));

  // Tắt cảnh báo về VirtualizedLists
  LogBox.ignoreLogs([
    "VirtualizedLists should never be nested inside plain ScrollViews",
  ]);

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

  const fetchDisasters = async () => {
    try {
      const res = await disasterApi.getOngoingDisasters();

      const disasterOptions = res.data.map((disaster: Disaster) => ({
        label: disaster.Name, 
        value: disaster.id, 
      }));
      await setDisasters(disasterOptions);
      if (selectedDisaster === null) {
        setSelectedDisaster(disasterOptions[0]?.value);
      }
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

      const res = await locationApi.convertLocation(
        latitude.toString(),
        longitude.toString()
      );

      setAddress(
        `${res.data?.Province?.FullName}, ${res.data?.District?.FullName}, ${
          res.data?.Ward?.FullName
        } ${res.data?.Road !== null ? `, ${res.data?.Road}` : ""}${
          res.data?.Amenity !== null ? `, ${res.data?.Amenity}` : ""
        }`
      );
      setSelectedProvince(res.data.Province.id);
      setSelectedDistrict(res.data.District.id);
      setSelectedWard(res.data.Ward.id);

      const { Road, Amenity } = res.data;
      if (Road) {
        setRoad(Road);
        setAddressDetail(Road);
      }
      if (Amenity) {
        setAmenity(Amenity);
        setAddressDetail((prev) => (prev ? `${prev}, ${Amenity}` : Amenity));
      }

      setLoadingLocation(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Lỗi lấy vị trí.");
      setLoadingLocation(false);
    }
  };

  const pickImage = async (index: number) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
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

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Audio recording permission is required."
        );
        return;
      }

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        outputFormat: ".mp3",
      });
      setRecording(recording);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecordingUri(uri);
        setAudioFiles((prev) => [...prev, uri]);
        setRecording(null);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const playAudio = async (uri: string, index: number) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setPlayingIndex(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      setPlayingIndex(index);

      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          // Dừng phát khi hoàn tất
          setPlayingIndex(null);
          setSound(null);
        }
      });
    } catch (error) {
      console.error("Lỗi khi phát âm thanh:", error);
      Alert.alert("Lỗi", "Không thể phát tệp âm thanh.");
    }
  };

  const removeAudioFile = (index: number) => {
    const newAudioFiles = [...audioFiles];
    newAudioFiles.splice(index, 1); // Xóa file tại vị trí index
    setAudioFiles(newAudioFiles);
  };

  const handleSubmit = async () => {
    if (!fullName || !phoneNumber || !selectedDisaster || !peopleCount) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc (*).");
      return;
    }

    if (
      // !lat ||
      // !lng ||
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard
    ) {
      Alert.alert("Lỗi", "Vui lòng chọn vị trí hoặc nhập");
      return;
    }

    const requestData: CreateSosRequest = {
      data: {
        FullName: fullName,
        RequestDescription: description,
        PeopleCount: peopleCount,
        NeedWater: needWater,
        NeedFood: needFood,
        NeedMedical: needMedical,
        PhoneNumber: phoneNumber,
        Disaster: selectedDisaster,
      },
    };

    if (lat && lng) {
      requestData.data.Location = {
        lat: lat?.toString(),
        lng: lng?.toString(),
      };
    }

    if (selectedProvince && selectedDistrict && selectedWard) {
      requestData.data.Province = selectedProvince;
      requestData.data.District = selectedDistrict;
      requestData.data.Ward = selectedWard;
    }

    if (road) {
      requestData.data.Road = road;
    }
    if (amenity) {
      requestData.data.Amenity = amenity;
    }
    if (addressDetail) {
      requestData.data.Amenity = addressDetail;
      delete requestData.data.Road;
    }

    setIsSubmitting(true); // Bắt đầu quay vòng
    try {
      let imageIds = [];
      let audioIds = [];
      const imageUrl = images.filter((image) => image !== null);
      if (imageUrl?.length > 0) {
        const res = await uploadApi.uploadImageFiles(imageUrl);
        imageIds = res.map((file) => file.id);
        requestData.data.DamageImage = imageIds;
      }
      if (audioFiles?.length > 0) {
        const res = await uploadApi.uploadAudioFiles(audioFiles);
        audioIds = res.map((file) => file.id);
        requestData.data.AudioFile = audioIds;
      }

      const response = await sosRequestApi.createSosRequest(requestData);
      Alert.alert(
        "Thành công",
        "Yêu cầu hỗ trợ của bạn đã được gửi đi. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể."
      );
      setFullName("");
      setDescription("");
      setPeopleCount(1);
      setNeedWater(false);
      setNeedFood(false);
      setNeedMedical(false);
      setPhoneNumber("");
      setImages([null, null, null, null]);
      setAudioFiles([]);
      setRecording(null);
      setRecordingUri(null);
      setPlayingIndex(null);
      setSound(null);
      setIsExpanded(false);
      setExpandedAdress(false);
    } catch (error: any) {
      console.log(error?.response?.data || error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi yêu cầu hỗ trợ.");
    } finally {
      setIsSubmitting(false); // Kết thúc quay vòng
    }
  };

  useEffect(() => {
    fetchDistricts();
    setWards([]);
  }, [selectedProvince]);

  useEffect(() => {
    fetchWards();
  }, [selectedDistrict]);

  useFocusEffect(
    React.useCallback(() => {
      fetchDisasters();
    }, [])
  );

  useEffect(() => {
    fetchDisasters();
    fetchProvinces();
    const getLocationCurrent = async () => {
      await getLocation();
    }
    getLocationCurrent();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ThemedView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView  showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
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
              value={peopleCount.toString()}
              keyboardType="numeric"
              onChangeText={(text) => setPeopleCount(parseInt(text) || 0)}
            />

            <View
              style={[styles.pickerContainer, { width: "100%", marginTop: 14 }]}
            >
              <RNPickerSelect
                value={selectedDisaster}
                onValueChange={(value) => setSelectedDisaster(value)}
                items={disasters?.length ? disasters : []}
                placeholder={{ label: "Chọn thiên tai*", value: null }}
                style={{
                  ...pickerSelectStyles,
                }}
              />
            </View>

            {/* Address and Pick Button */}
            <View style={styles.addressContainer}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <Text
                  style={[address ? { fontSize: 16} : { color: "#9ca3af", fontSize: 16 }]}
                >
                  {address || "Lấy địa chỉ *"}
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

            {/* Accordion cho icung cấp thông tin thêm */}
            <TouchableOpacity
              style={[
                {
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                  position: "relative",
                },
              ]}
              onPress={toggleAccordionAdress}
            >
              <Text style={styles.toggleText}>
                {isExpandedAdress ? "Hoặc nhập địa chỉ*" : "Hoặc nhập địa chỉ*"}
              </Text>
              <Ionicons
                name={isExpandedAdress ? "chevron-up" : "chevron-down"}
                size={20}
                color="#0ea5e9"
                style={{ position: "absolute", right: 4 }}
              />
            </TouchableOpacity>

            <Animated.View style={[styles.extraInputs, animatedStyleAdress]}>
              {/* Dropdown for location */}

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginTop: 14,
                  justifyContent: "space-between",
                }}
              >
                <View style={[styles.pickerContainer, { width: "48%" }]}>
                  <RNPickerSelect
                    value={selectedProvince}
                    onValueChange={(value) => setSelectedProvince(value)}
                    items={provinces?.length ? provinces : []}
                    placeholder={{ label: "Chọn tỉnh/thành phố*", value: null }}
                    style={{
                      ...pickerSelectStyles,
                    }}
                  />
                </View>

                <View style={[styles.pickerContainer, { width: "48%" }]}>
                  <RNPickerSelect
                    value={selectedDistrict}
                    onValueChange={(value) => setSelectedDistrict(value)}
                    items={districts?.length ? districts : []}
                    placeholder={{ label: "Chọn quận/huyện*", value: null }}
                    style={{
                      ...pickerSelectStyles,
                    }}
                  />
                </View>
              </View>

              {/* // Dropdown for wards */}
              <View
                style={[
                  styles.pickerContainer,
                  { width: "100%", marginTop: 14 },
                ]}
              >
                <RNPickerSelect
                value={selectedWard}
                  onValueChange={(value) => setSelectedWard(value)}
                  items={wards?.length ? wards : []}
                  placeholder={{ label: "Chọn phường/xã*", value: null }}
                  style={{
                    ...pickerSelectStyles,
                  }}
                />
              </View>
            </Animated.View>

            <TextInput
              style={styles.input}
              placeholder="Địa chỉ chi tiết"
              value={addressDetail}
              onChangeText={setAddressDetail}
            />

            {/* Thanh ngang ghi âm */}
            <View style={styles.recordBar}>
              <Text style={styles.statusText}>
                {recording ? "Đang ghi âm..." : "Ghi âm nhanh nội dung"}
              </Text>
              <TouchableOpacity
                style={recording ? styles.stopButton : styles.startButton}
                onPress={recording ? stopRecording : startRecording}
              >
                <Ionicons
                  name={recording ? "stop" : "mic-outline"}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* Danh sách file ghi âm */}
            <FlatList
              data={audioFiles}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.audioCard}>
                  <Text
                    numberOfLines={1}
                    style={styles.audioText}
                  >
                    {item.split("/").pop()}
                  </Text>
                  <View style={styles.cardButtons}>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => playAudio(item, index)}
                    >
                      <Text style={styles.buttonText}>
                        {playingIndex === index ? (
                          <Ionicons name="pause" size={16} color="#fff" />
                        ) : (
                          <Ionicons name="play" size={16} color="#fff" />
                        )}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeAudioFile(index)}
                    >
                      <Text style={styles.buttonText}>
                        <Ionicons name="trash" size={16} color="#fff" />
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            {/* Accordion cho icung cấp thông tin thêm */}
            <TouchableOpacity
              style={[
                {
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                  position: "relative",
                },
              ]}
              onPress={toggleAccordion}
            >
              <Text style={styles.toggleText}>
                {isExpanded
                  ? "Cung cấp thêm thông tin"
                  : "Cung cấp thêm thông tin"}
              </Text>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#0ea5e9"
                style={{ position: "absolute", right: 4 }}
              />
            </TouchableOpacity>

            <Animated.View style={[styles.extraInputs, animatedStyle]}>
              <Text
                style={{
                  marginTop: 14,
                  fontSize: 16,
                  color: "#9ca3af",
                }}
              >
                Thêm ảnh mô tả:
              </Text>
              <View style={styles.grid}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    {image ? (
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: image }}
                          style={styles.imagePick}
                        />
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

              <TextInput
                // style={styles.input}
                style={{
                  ...styles.input,
                  height: 64,
                  textAlignVertical: "top",
                }}
                placeholder="Mô tả hiện trạng, nhu cầu bằng văn bản"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={4}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
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
                  style={[
                    styles.switchContainer,
                    { justifyContent: "flex-end" },
                  ]}
                >
                  <Text style={styles.switchLabel}>Y tế</Text>
                  <Switch value={needMedical} onValueChange={setNeedMedical} />
                </View>
              </View>
            </Animated.View>

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
    paddingTop: 40,
    flexGrow: 1, // Make sure content takes full height
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginTop: 8,
  },
  textDes: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 4,
    marginTop: 4,
    paddingHorizontal: 16,
  },
  image: {
    width: 80,
    height: 80,
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    height: 44,
    fontSize: 16,
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
    fontWeight: "600",
  },
  locationCard: {
    marginTop: 12,
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
    marginTop: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    height: 44,
  },
  // picker
  pickButton: {
    transform: [{ translateX: 4 }],
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  inputAddress: {
    flex: 1,
  },
  dropdown: {
    marginTop: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 99,
  },
  dropdownList: {
    borderColor: "#ccc",
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
    // flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imageWrapper: {
    width: 74,
    height: 74,
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
  pickButtonAudio: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 14,
  },
  pickButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // Thêm thông tin
  toggleText: {
    fontSize: 16,
    color: "#0ea5e9",
    marginLeft: 4,
    textDecorationLine: "underline",
  },
  // Ghi âm
  recordBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // backgroundColor: "#cccc",
    borderWidth: 0.6,
    borderColor: "#ccc",
    // padding: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 14,
  },
  startButton: {
    backgroundColor: "#4caf50",
    padding: 4,
    borderRadius: 50,
    // marginRight: 8,
  },
  stopButton: {
    backgroundColor: "#e53935",
    padding: 4,
    borderRadius: 50,
    // marginRight: 16,
  },
  statusText: {
    color: "#9ca3af",
    fontSize: 16,
  },
  audioCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    borderWidth: 0.6,
    borderColor: "#ccc",
    marginTop: 12,
    paddingVertical: 4,
  },
  audioText: {
    fontSize: 13,
    color: "#333",
    flex: 1,
    padding: 8,
  },
  cardButtons: {
    flexDirection: "row",
  },
  playButton: {
    backgroundColor: "#1e88e5",
    padding: 7,
    alignContent: "center",
    borderRadius: "100%",
    marginRight: 6,
    width: 30,
    height: 30,
  },
  deleteButton: {
    backgroundColor: "#e53935",
    padding: 7,
    alignContent: "center",
    borderRadius: "100%",
    marginRight: 8,
    width: 30,
    height: 30,
  },
  buttonTextAudio: {
    color: "#fff",
    fontSize: 14,
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
    // paddingHorizontal: 10,
    // paddingVertical: 8,
    // borderWidth: 1,
    // borderColor: "#ccc",
    // borderRadius: 8,
    // color: "black",
    // backgroundColor: "#000",
  },
});
