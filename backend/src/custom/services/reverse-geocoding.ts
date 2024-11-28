import axios from "axios";

export const getLocationFromCoordinates = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          format: "jsonv2", // Định dạng trả về JSON
          lat: lat, // Vĩ độ
          lon: lon, // Kinh độ
          addressdetails: 1, // Bao gồm chi tiết địa chỉ
          accept_language: "vi", // Trả về thông tin bằng tiếng Việt
        },
      }
    );

    const address = response.data.address;

    if (address) {
      const province = address.state || null; // Tên tỉnh/thành phố
      const district = address.city || null; // Tên quận/huyện
      const ward = address.suburb || null; // Tên phường/xã

      return {
        province: province || "Không xác định",  // Nếu không có tỉnh, trả về thông báo mặc định
        district: district || "Không xác định", // Nếu không có quận/huyện, trả về thông báo mặc định
        ward: ward || "Không xác định",         // Nếu không có phường/xã, trả về thông báo mặc định
      };
    }

    throw new Error("Unable to find location from coordinates");
  } catch (error) {
    console.error("Error reverse geocoding:", error.message);
    throw new Error("Failed to reverse geocode coordinates");
  }
};
