import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { SosRequest } from "@/types/sos-request";
import { Notification } from "@/types/notification";
import { useFocusEffect } from "expo-router";
import { Disaster } from "@/types/disaster";
import DropDownPicker from "react-native-dropdown-picker";
import disasterApi from "@/api/disasterApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/user";
import { SupportOrganization } from "@/types/supportOrganization";
import notificationApi from "@/api/notificationApi";

interface MapProps {}
type Province = {
  name: string;
  location: {
    lng: number;
    lat: number;
  };
};

export default function Map(props: MapProps) {
  const webviewRef = useRef(null);

  const [disastersDropDown, setDisastersDropDown] = useState<
    { label: string; value: number }[]
  >([]);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [disasters, setDisasters] = useState<Disaster[]>([]);

  const [selectedDisaster, setSelectedDisaster] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [organizationInfo, setOrganizationInfo] =
    useState<SupportOrganization | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Gửi message tới WebView
  const sendMessageToWebView = (data: any) => {
    if (webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify(data));
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

  const handleZoomIn = () => {
    sendMessageToWebView({ action: "zoom_in" });
  };

  const handleZoomOut = () => {
    sendMessageToWebView({ action: "zoom_out" });
  };

  const handleMoveToCurrentLocation = async () => {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude, longitude } = location.coords;

    sendMessageToWebView({ latitude, longitude, zoom: 12, action: "move" });
  };

  const handleDisplayNotification = async () => {
    if (notifications?.length > 0) {
      const sosRequestsWithPopupContent = notifications.map((notifi) => ({
        ...notifi,
        popupContent: generatePopupContent(
          notifi?.SOSRequest?.FullName,
          notifi?.SOSRequest?.PhoneNumber
        ),
      }));

      sendMessageToWebView({
        action: "add_markers",
        notification: sosRequestsWithPopupContent,
      });
    }
  };

  const fetchOngoingDisasters = async () => {
    try {
      const res = await disasterApi.getOngoingDisasters();
      const disasterOptions = res.data.map((disaster: Disaster) => ({
        label: disaster.Name,
        value: disaster.id,
      }));
      setDisasters(res.data);
      setDisastersDropDown(disasterOptions);
      if (selectedDisaster == null) {
        setSelectedDisaster(res.data[0]?.id);
      }
    } catch (error: any) {
      console.log("Failed to fetch ongoing disasters:", error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      if (organizationInfo && accessToken) {
        const res = await notificationApi.getNotificationsBySupportOrganization(
          organizationInfo.id,
          accessToken,
          1,
          100,
          false,
          null
        );
        setNotifications(res.data);
      }
    } catch (error: any) {
      console.log("Failed to fetch notifications:", error);
    }
  };

  // Fetch data from AsyncStorage
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
      console.log("Failed to fetch data from AsyncStorage", error);
    }
  };

  const handleDisplayDisaster = () => {
    if (selectedDisaster && loading == false) {
      const disaster = disasters.find((d) => d.id === selectedDisaster);
      if (disaster) {
        if (disaster?.Provinces) {
          setProvinces(
            disaster.Provinces.map((province) => ({
              name: province.Name,
              location: {
                lng: Number(province.Longitude),
                lat: Number(province.Latitude),
              },
            }))
          );
        }
      }
    }
  };

  useEffect(() => {
    handleDisplayDisaster();
  }, [selectedDisaster]);

  useEffect(() => {
    getCurrentLocation();
    handleDisplayNotification();
  }, [notifications]);

  useEffect(() => {
    if (organizationInfo && loading == false) {
      fetchNotifications();
    }
  }, [organizationInfo]);

  useEffect(() => {
    checkAccessToken();
    fetchOngoingDisasters();
    getCurrentLocation();
    fetchNotifications();
    handleDisplayDisaster();
  }, [loading]);

  useEffect(() => {
    handleMoveToCurrentLocation();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkAccessToken();
      fetchOngoingDisasters();
      getCurrentLocation();
      fetchNotifications();
      handleDisplayDisaster();
    }, [])
  );

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

    
        const provinces = ${JSON.stringify(provinces)};
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
      const markers = {};

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

        notification.forEach(({ SOSRequest, popupContent }) => {
       
         const marker = new mapboxgl.Marker({ color: 'red' })
                .setLngLat([SOSRequest.Location.lng, SOSRequest.Location.lat])
                .addTo(map);
             
              // Create popup for the marker with dynamic content
              const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: false, closeButton: false })
                .setHTML(popupContent);

              marker.setPopup(popup); // Attach the popup to the marker
          });

        }
      });
    </script>
  </body>
</html>
  `;

  return (
    <View style={styles.container}>
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
        onLoadEnd={() => {
          setLoading(false);
        }}
      />
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#9ca3af" }]}
          onPress={handleZoomIn}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#9ca3af" }]}
          onPress={handleZoomOut}
        >
          <Ionicons name="remove" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.locationButton]}
          onPress={handleMoveToCurrentLocation}
        >
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={openDropdown}
          value={selectedDisaster}
          items={disastersDropDown}
          setOpen={setOpenDropdown}
          setValue={setSelectedDisaster}
          listItemLabelStyle={{ fontWeight: 700 }}
          labelStyle={{ fontWeight: 700, color: "red", fontSize: 14 }}
          placeholder="Chọn loại thảm họa *"
          style={styles.dropdown}
          placeholderStyle={{ color: "#9ca3af" }}
          dropDownContainerStyle={{ borderColor: "#ccc", marginTop: 2 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    bottom: 40,
    right: 10,
    flexDirection: "column",
    alignItems: "center",
  },
  button: {
    marginBottom: 10,
    backgroundColor: "#50bef1",
    padding: 8,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  locationButton: {
    marginTop: 20,
  },
  dropdownContainer: {
    position: "absolute",
    top: 40,
    right: 10,
  },
  dropdown: {
    justifyContent: "center",
    minWidth: 200,
    fontWeight: "bold",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
  },
});
