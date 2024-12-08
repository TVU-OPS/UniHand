import { ThemedView } from "@/components/ThemedView";
import { SosRequest } from "@/types/sos-request";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Image,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
  Alert,
  Button,
} from "react-native";
import sosRequestApi from "@/api/sosRequestApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/user";
import { SupportOrganization } from "@/types/supportOrganization";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import WebView from "react-native-webview";
import { Province } from "@/types/province";
import * as Location from "expo-location";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function SosRequestDetailScreen() {
  const [sosRequest, setSosRequest] = useState<SosRequest | null>(null);
  const local = useLocalSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [organizationInfo, setOrganizationInfo] =
    useState<SupportOrganization | null>(null);

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const webviewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Accordion state
  const [isExpanded, setIsExpanded] = useState(false);
  const heightValue = useSharedValue(0);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
    heightValue.value = isExpanded ? 0 : 400; // Đặt chiều cao cho accordion
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(heightValue.value, { duration: 300 }),
    overflow: "hidden",
  }));

  const fetchSosRequest = async () => {
    if (!local.id || !accessToken) {
      return;
    }
    try {
      const res = await sosRequestApi.getSosRequest(
        local.id.toString(),
        accessToken
      );
      setSosRequest(res.data);
    } catch (error: any) {
      console.log("Failed to fetch sosRequest:", error);
    }
  };

  const playAudio = async (uri: string) => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    } else {
      await setIsPlaying(true);
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setSound(null);
        }
      });
    }
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

  useEffect(() => {
    fetchSosRequest();
  }, [local?.id, accessToken]);

  // Generate the popup content for each SOS request
  const generatePopupContent = (FullName: string, PhoneNumber: string) => {
    return `
          <p style="font-size: 18px; font-weight: bold; margin: 0px;">${FullName}</p>
          <a target="_blank" rel="nofollow noreferrer noopener" style="margin-top: 6px; font-size: 13px; text-decoration: none; display: inline-flex; gap: 4px; align-items: center; padding: 4px 6px; border-radius: 5px; background-color: #10b981; font-weight: bold; color: white" href="tel:${PhoneNumber}">
          <i class="fas fa-phone"></i>
          <span style="font-size: 18px">0929492892</span>
        </a>
        `;
  };

  // Gửi message tới WebView
  const sendMessageToWebView = (data: any) => {
    if (webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify(data));
    }
  };

  const reloadWebView = () => {
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  const handleDisplayNotification = async () => {
    if (sosRequest) {
      const sosRequestsWithPopupContent = {
        ...sosRequest,
        popupContent: generatePopupContent(
          sosRequest?.FullName,
          sosRequest?.PhoneNumber
        ), // Add the popup content dynamically
      };

      sendMessageToWebView({
        action: "add_markers",
        notification: sosRequestsWithPopupContent,
      });
    }
  };

  // Lấy vị trí hiện tại và theo dõi
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Quyền truy cập vị trí bị từ chối.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude, longitude } = location.coords;

    // Cập nhật vị trí hiện tại
    sendMessageToWebView({ latitude, longitude, action: "update" });

    // Theo dõi vị trí
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 10,
      },
      (newLocation) => {
        const { latitude, longitude } = newLocation.coords;
        sendMessageToWebView({ latitude, longitude, action: "update" });
      }
    );
  };

  const handleMoveToCurrentLocation = async () => {
    const latitude = sosRequest?.Location.lat;
    const longitude = sosRequest?.Location.lng;

    sendMessageToWebView({ latitude, longitude, zoom: 12, action: "move" });
  };

  useEffect(() => {
    if (loading == false) {
      handleDisplayNotification();
      getCurrentLocation();
      handleMoveToCurrentLocation();
    }
  }, [loading]);

  const mapHTML = `
  <!DOCTYPE html>
<html>
 <head>
   <meta charset="utf-8" />
   <title>Map Example</title>
   <meta
     name="viewport"
     content="initial-scale=1,maximum-scale=1,user-scalable=no"
   />
   <link href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css" rel="stylesheet" />
   <script src="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js"></script>
   <script
       src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.1/mapbox-gl-directions.js"></script>
   <link href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.1/mapbox-gl-directions.css"
       rel="stylesheet" />
   <style>
     body {
       margin: 0;
       padding: 0;
     }
     #map {
       position: absolute;
       top: 0;
       bottom: 0;
       width: 100%;
     }
   </style>
 </head>
 <body>
   <div id="map"></div>
   <script>

   
      //  const provinces = ${JSON.stringify(provinces)};
      
const provinces = [
  // Có chữ Tỉnh với Thành phố hay không cũng đc, ví dụ Tỉnh Trà Vinh hay Trà Vinh đều được
  // { name: "Tỉnh Trà Vinh", location: { lng: 106.34449, lat: 9.81274 } },
  // { name: "Tỉnh Bến Tre", location: { lng: 106.4811559, lat: 10.1093637 } },
  // { name: "Tỉnh Vĩnh Long", location: { lng: 105.9669665, lat: 10.1203043 } },
];
      // Toàn bộ khúc dưới không sửa

       function calculateCenter(points) {
           // Kiểm tra xem danh sách tọa độ có rỗng hay không
           if (!points || points.length === 0) {
             return { lng: 106.34449, lat: 9.81274 };
               // return null; // Không có tọa độ nào để tính
           }

           let totalX = 0, totalY = 0;

           // Duyệt qua danh sách tọa độ và tính tổng
           points.forEach(point => {
               totalX += point.lng;
               totalY += point.lat;
           });

           // Tính trung bình cộng
           const centerX = totalX / points.length;
           const centerY = totalY / points.length;

           // Trả về tọa độ trung tâm
           return { lng: centerX, lat: centerY };
       }
     // Hàm chuẩn hóa chuỗi
       function normalizeString(str) {
           return str
               .replace(/Tỉnh/g, '')
               .replace(/Thành phố/g, '')
               .trim(); // Xóa khoảng trắng đầu và cuối chuỗi
       }

       mapboxgl.accessToken =
           "pk.eyJ1IjoiZGhpZXAyMzA3IiwiYSI6ImNtNDRpeDFtejBuNzkycHB6bXp6eWZ1MTQifQ.169cDiC_Q2YWzRBdIxxgPg";

       const posTestList = provinces.map(province => province.location);
       const center = calculateCenter(posTestList);

        const map = new mapboxgl.Map({
           style: "mapbox://styles/dhiep2307/cm44mghvy011l01sd5cci6k20", // stylesheet location
           container: "map", // container ID
           center: [center.lng, center.lat], // starting position [lng, lat]. Note that lat must be set between -90 and 90
           zoom: 8, // starting zoom
       });

       const provinceNames = provinces.map(province => normalizeString(province.name));
       map.on('load', function () {
           map.addSource('diaphanhuyen-4apinm', {
               type: 'vector',
               url: 'mapbox://dhiep2307.0va1jnhw'
           });

           map.addLayer({
               'id': 'loc-tinh',
               'type': 'fill',
               'source': 'diaphanhuyen-4apinm',
               'source-layer': 'diaphanhuyen-4apinm',
               'layout': {},
               'paint': {
                   'fill-color': '#ff6666',
                   'fill-opacity': 0.2
               },
               'filter': ['in', 'Ten_Tinh', ...provinceNames]
           });

           provinces.forEach((e) => {
               map.addLayer({
                   'id': 'text-layer-tinh-' + e.name,
                   'type': 'symbol',
                   'source': {
                       'type': 'geojson',
                       'data': {
                           'type': 'FeatureCollection',
                           'features': [
                               {
                                   'type': 'Feature',
                                   'geometry': {
                                       'type': 'Point',
                                       'coordinates': [e.location.lng, e.location.lat]
                                   },
                                   'properties': {
                                       'title': e.name  // Văn bản sẽ hiển thị
                                   }
                               }
                           ]
                       }
                   },
                   'layout': {
                       'text-field': ['get', 'title'],  // Lấy giá trị từ thuộc tính 'title' để hiển thị
                       'text-size': [
                           'interpolate',  // Biểu thức interpolate giúp thay đổi kích thước theo zoom
                           ['linear'],  // Mức độ thay đổi là tuyến tính
                           ['zoom'],  // Sử dụng zoom level để điều chỉnh
                           5, 9,  // Zoom level 5: 10px (kích thước chữ nhỏ)
                           15, 30  // Zoom level 15: 30px (kích thước chữ lớn)
                       ],  // Kích thước chữ
                       'text-anchor': 'center',  // Căn chỉnh chữ theo giữa điểm
                       'text-offset': [0, 0],  // Định vị trí chữ (tùy chọn)
                   },
                   'paint': {
                       'text-color': '#186bf0',  // Màu chữ
                       'text-halo-color': '#FFFFFF',  // Màu viền chữ
                       'text-halo-width': 2  // Độ rộng viền chữ
                   }
               });
           });

           // Không sửa
           // Thêm một layer kiểu symbol để hiển thị chữ Quần đảo Trường Sa (Việt Nam)
           map.addLayer({
               'id': 'text-layer-truong-sa',
               'type': 'symbol',
               'source': {
                   'type': 'geojson',
                   'data': {
                       'type': 'FeatureCollection',
                       'features': [
                           {
                               'type': 'Feature',
                               'geometry': {
                                   'type': 'Point',
                                   'coordinates': [113.81768, 9.46653]
                               },
                               'properties': {
                                   'title': 'Quần đảo Trường Sa (Việt Nam)'
                               }
                           }
                       ]
                   }
               },
               'layout': {
                   'text-field': ['get', 'title'],  // Lấy giá trị từ thuộc tính 'title' để hiển thị
                   'text-size': [
                       'interpolate',  // Biểu thức interpolate giúp thay đổi kích thước theo zoom
                       ['linear'],  // Mức độ thay đổi là tuyến tính
                       ['zoom'],  // Sử dụng zoom level để điều chỉnh
                       5, 9,  // Zoom level 5: 10px (kích thước chữ nhỏ)
                       15, 30  // Zoom level 15: 30px (kích thước chữ lớn)
                   ],  // Kích thước chữ
                   'text-anchor': 'center',  // Căn chỉnh chữ theo giữa điểm
                   'text-offset': [0, 0],  // Định vị trí chữ (tùy chọn)
               },
               'paint': {
                   'text-color': '#186bf0',  // Màu chữ
                   'text-halo-color': '#FFFFFF',  // Màu viền chữ
                   'text-halo-width': 2  // Độ rộng viền chữ
               }
           });

           // Không sửa
           // Thêm một layer kiểu symbol để hiển thị chữ Quần đảo Hoàng Sa (Việt Nam)
           map.addLayer({
               'id': 'text-layer-hoang-sa',
               'type': 'symbol',
               'source': {
                   'type': 'geojson',
                   'data': {
                       'type': 'FeatureCollection',
                       'features': [
                           {
                               'type': 'Feature',
                               'geometry': {
                                   'type': 'Point',
                                   'coordinates': [111.90739, 16.50884]
                               },
                               'properties': {
                                   'title': 'Quần đảo Hoàng Sa (Việt Nam)'  // Văn bản sẽ hiển thị
                               }
                           }
                       ]
                   }
               },
               'layout': {
                   'text-field': ['get', 'title'],  // Lấy giá trị từ thuộc tính 'title' để hiển thị
                   'text-size': [
                       'interpolate',  // Biểu thức interpolate giúp thay đổi kích thước theo zoom
                       ['linear'],  // Mức độ thay đổi là tuyến tính
                       ['zoom'],  // Sử dụng zoom level để điều chỉnh
                       5, 9,  // Zoom level 5: 10px (kích thước chữ nhỏ)
                       15, 30  // Zoom level 15: 30px (kích thước chữ lớn)
                   ],  // Kích thước chữ
                   'text-anchor': 'center',  // Căn chỉnh chữ theo giữa điểm
                   'text-offset': [0, 0],  // Định vị trí chữ (tùy chọn)
               },
               'paint': {
                   'text-color': '#186bf0',  // Màu chữ
                   'text-halo-color': '#FFFFFF',  // Màu viền chữ
                   'text-halo-width': 2  // Độ rộng viền chữ
               }
           });

           // Không sửa
           // Thêm một layer kiểu symbol để hiển thị chữ Biển Đông
           map.addLayer({
               'id': 'text-layer-bien-dong',
               'type': 'symbol',
               'source': {
                   'type': 'geojson',
                   'data': {
                       'type': 'FeatureCollection',
                       'features': [
                           {
                               'type': 'Feature',
                               'geometry': {
                                   'type': 'Point',
                                   'coordinates': [113.23996, 13.84156]
                               },
                               'properties': {
                                   'title': 'Biển Đông'  // Văn bản sẽ hiển thị
                               }
                           }
                       ]
                   }
               },
               'layout': {
                   'text-field': ['get', 'title'],  // Lấy giá trị từ thuộc tính 'title' để hiển thị
                   'text-size': [
                       'interpolate',  // Biểu thức interpolate giúp thay đổi kích thước theo zoom
                       ['linear'],  // Mức độ thay đổi là tuyến tính
                       ['zoom'],  // Sử dụng zoom level để điều chỉnh
                       5, 9,  // Zoom level 5: 10px (kích thước chữ nhỏ)
                       15, 30  // Zoom level 15: 30px (kích thước chữ lớn)
                   ],  // Kích thước chữ
                   'text-anchor': 'center',  // Căn chỉnh chữ theo giữa điểm
                   'text-offset': [0, 0],  // Định vị trí chữ (tùy chọn)
               },
               'paint': {
                   'text-color': '#186bf0',  // Màu chữ
                   'text-halo-color': '#FFFFFF',  // Màu viền chữ
                   'text-halo-width': 2  // Độ rộng viền chữ
               }
           });

       });

     /////////////////////////////  

     document.addEventListener("message", (event) => {
       const data = JSON.parse(event.data);
       const { latitude, longitude, action, notification, zoom } = data;

       if (action === "update" || action === "move") {
         if (!markers["currentLocation"]) {
           markers["currentLocation"] = new mapboxgl.Marker()
             .setLngLat([longitude, latitude])
             .addTo(map);
         } else {
           markers["currentLocation"].setLngLat([longitude, latitude]);
         }

         if (action === "move") {
           map.flyTo({ center: [longitude, latitude], zoom: zoom });
         }
       } else if (action === "zoom_in") {
         map.zoomIn();
       } else if (action === "zoom_out") {
         map.zoomOut();
       } else if (action === "add_markers") {
            const marker = new mapboxgl.Marker({ color: 'red' })
               .setLngLat([notification.Location.lng, notification.Location.lat])
               .addTo(map);
            
             // Create popup for the marker with dynamic content
             const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: false, closeButton: false })
               .setHTML(notification.popupContent);

             marker.setPopup(popup); // Attach the popup to the marker
      }
     });
   </script>
 </body>
</html>
 `;

  if (!sosRequest) {
    return (
      <ThemedView style={styles.container}>
        <Text>Loading...</Text>
      </ThemedView>
    );
  }

  // Map

  return (
    <ThemedView style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="never"
          contentContainerStyle={styles.scrollContainer}
        >
          <Text style={styles.titleId}> #{sosRequest.id}</Text>
          <Text style={styles.title}> {sosRequest.FullName}</Text>
          <View style={[styles.infoContainer, { alignItems: "flex-start" }]}>
            <Ionicons name="document-text" size={20} color="#4CAF50" />
            <Text style={styles.label}>
              Mô tả: {sosRequest.RequestDescription}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Ionicons name="people" size={20} color="#4CAF50" />
            <Text style={styles.label}>
              Số người cần hỗ trợ: {sosRequest.PeopleCount}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Ionicons name="water" size={20} color="#4CAF50" />
            <Text style={styles.label}>
              Nước uống: {sosRequest.NeedWater ? "Có" : "Không"}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Ionicons name="fast-food" size={20} color="#4CAF50" />
            <Text style={styles.label}>
              Đồ ăn: {sosRequest.NeedFood ? "Có" : "Không"}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Ionicons name="medkit" size={20} color="#4CAF50" />
            <Text style={styles.label}>
              Y tế: {sosRequest.NeedMedical ? "Có" : "Không"}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Ionicons name="call" size={20} color="#4CAF50" />
            <Text style={styles.label}>
              Số điện thoại: {sosRequest.PhoneNumber}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Ionicons name="mail" size={20} color="#4CAF50" />
            <Text style={styles.label}>Email: {sosRequest.Email}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Ionicons name="map" size={20} color="#4CAF50" />
            <Text style={styles.label}>
              Tỉnh: {sosRequest.Province.FullName}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Ionicons name="map" size={20} color="#4CAF50" />
            <Text style={styles.label}>
              Huyện: {sosRequest.District.FullName}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Ionicons name="map" size={20} color="#4CAF50" />
            <Text style={styles.label}>Xã: {sosRequest.Ward.FullName}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Ionicons name="location" size={20} color="#4CAF50" />
            <Text style={styles.label}>
              Địa chỉ chi tiết: {sosRequest.Amenity}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.label}>
              Trạng thái: {sosRequest.State ? "Đã hỗ trợ" : "Đang hỗ trợ"}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Ionicons name="calendar" size={20} color="#4CAF50" />
            <Text style={styles.label}>
              Ngày tạo: {new Date(sosRequest.createdAt).toLocaleString()}
            </Text>
          </View>
          {/* <View style={styles.infoContainer}>
          <Ionicons name="calendar" size={20} color="#4CAF50" />
          <Text style={styles.label}>
            Ngày cập nhật: {new Date(sosRequest.updatedAt).toLocaleString()}
          </Text>
        </View> */}

          {sosRequest?.AudioFile == null && (
            <View style={styles.infoContainer}>
              <Ionicons name="musical-notes" size={20} color="#4CAF50" />
              <Text style={styles.label}>File âm thanh: Không có</Text>
            </View>
          )}

          {sosRequest?.AudioFile && sosRequest?.AudioFile.length > 0 && (
            <View style={styles.audioContainer}>
              <View style={styles.infoContainer}>
                <Ionicons name="musical-notes" size={20} color="#4CAF50" />
                <Text style={styles.label}>File âm thanh:</Text>
              </View>
              {sosRequest?.AudioFile.map((audio) => (
                <TouchableOpacity
                  key={audio.id}
                  onPress={() =>
                    playAudio(`${process.env.EXPO_PUBLIC_API_URL}${audio.url}`)
                  }
                  style={styles.audioButton}
                >
                  <Text style={styles.audioText} numberOfLines={1}>
                    {isPlaying ? (
                      <Ionicons name="pause" size={20} color="#6b7280" />
                    ) : (
                      <Ionicons name="play" size={20} color="#6b7280" />
                    )}
                  </Text>
                  <Text style={styles.audioText} numberOfLines={1}>
                    {audio.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={[styles.infoContainer]}>
            <Ionicons name="image" size={20} color="#4CAF50" />
            <Text style={[styles.label]}>Ảnh thiệt hại:</Text>
          </View>
          <View style={styles.imageContainer}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.imageWrapper}>
                {sosRequest.DamageImage && sosRequest.DamageImage[index] ? (
                  <Image
                    source={{
                      uri: `${process.env.EXPO_PUBLIC_API_URL}${sosRequest.DamageImage[index].url}`,
                    }}
                    style={styles.image}
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons name="image" size={20} color="#ccc" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity
          style={styles.buttonSheetModal}
          onPress={toggleAccordion}
        >
          <Text style={styles.buttonSheetModalText}>
            {isExpanded ? "ĐÓNG BẢN ĐỒ" : "XEM BẢN ĐỒ"}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-down" : "chevron-up"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
        <Animated.View style={[styles.extraInputs, animatedStyle]}>
          <View style={{ width: "100%", backgroundColor: "#ccc", height: 500 }}>
            <WebView
              ref={webviewRef}
              source={{ html: mapHTML }}
              javaScriptEnabled={true}
              onMessage={(event) => {
                console.log("WebView message:", event);
              }}
              originWhitelist={["https://*", "http://*", "file://*", "sms://*"]}
              setSupportMultipleWindows={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              onLoadStart={() => {
                setLoading(true);
              }}
              // onLoading={() => {
              //   setLoading(false);
              // }}
              onLoadEnd={() => {
                setLoading(false);
              }}
            />
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 20,
  },

  titleId: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#6b7280",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#ef4444",
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginLeft: 10,
  },
  imageContainer: {
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  imageWrapper: {
    width: "48%",
    height: 200,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  audioContainer: {},
  audioButton: {
    fontSize: 14,
    color: "blue",
    textDecorationLine: "underline",
    borderWidth: 0.5,
    borderColor: "#ccc",
    padding: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    gap: 4,
  },
  audioText: {},

  contentContainer: {
    minHeight: 200,
  },

  buttonSheetModal: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#38bdf8",
    gap: 4,
    padding: 12,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    // margin: 10,
    alignItems: "center",
    width: "100%",
  },
  buttonSheetModalText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
