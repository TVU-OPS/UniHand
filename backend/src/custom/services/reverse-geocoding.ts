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
      const province = address.state || address.city || null; // Tên Tỉnh / Thành phố
      const district = address.city || address.county || null; // Tên quận / Huyện / Thị xã / Thành phố trực thuộc tỉnh
      const ward = address.suburb || address.village || address.town || null; // Tên phường/ Xã / Thị trấn
      const road = address.road || null; // Tên đường
      const amenity = address.amenity || address.hamlet || null; // Tên địa điểm / Thôn

      return {
        province: province || null, // Nếu không có tỉnh, trả về thông báo mặc định
        district: district || null, // Nếu không có quận/huyện, trả về thông báo mặc định
        ward: ward || null, // Nếu không có phường/xã, trả về thông báo mặc định
        road: road || null, // Nếu không có tên đường, trả về thông báo mặc định
        amenity: amenity || null, // Nếu không có tên địa điểm, trả về thông báo mặc định
      };
    }

    throw new Error("Unable to find location from coordinates");
  } catch (error) {
    console.error("Error reverse geocoding:", error.message);
    throw new Error("Failed to reverse geocode coordinates");
  }
};
