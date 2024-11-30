import { getLocationFromCoordinates } from "../../../custom/services/reverse-geocoding";

const axios = require("axios");

module.exports = {
  async handleConvert(ctx) {
    try {
      const { Location } = ctx.request.body.data;
      let Province = null;
      let District = null;
      let Ward = null;
      let Road = null;
      let Amenity = null;

      // Kiểm tra đầu vào
      if (!Location || !Location.lat || !Location.lng) {
        return ctx.badRequest(
          "Invalid location data. Please provide lat and lng."
        );
      }

      if (Location) {
        const { lat, lng } = Location;

        const addressDetails = await getLocationFromCoordinates(lat, lng);
        Road = addressDetails.road;
        Amenity = addressDetails.amenity;

        // Chuẩn hóa tên tỉnh, huyện, xã trước khi tìm kiếm
        const normalizedProvince = normalizeLocationName(
          addressDetails.province
        );
        const normalizedDistrict = normalizeLocationName(
          addressDetails.district
        );

        // Tìm kiếm trong cơ sở dữ liệu để lấy id của tỉnh, huyện và xã theo tên
        const provinceRecord = await strapi.db
          .query("api::province.province")
          .findOne({
            where: {
              ProvinceName: {
                $contains: normalizedProvince, // Tìm kiếm tỉnh/thành phố
              },
            },
          });

        const districtRecord = await strapi.db
          .query("api::district.district") // Giả sử bạn có bảng district
          .findOne({
            where: {
              DistrictName: {
                $contains: normalizedDistrict, // Tìm kiếm huyện/quận
              },
              Province: provinceRecord.id,
            },
          });

        const wardRecord = await strapi.db
          .query("api::ward.ward") // Giả sử bạn có bảng ward
          .findOne({
            where: {
              WardName: {
                $contains: addressDetails.ward, // Tìm kiếm xã/phường
              },
              District: districtRecord.id,
            },
          });

        strapi.log.info(
          `Found Province: ${provinceRecord ? provinceRecord.id : "Not Found"}, District: ${districtRecord ? districtRecord.id : "Not Found"}, Ward: ${wardRecord ? wardRecord.id : "Not Found"}`
        );

        if (provinceRecord) {
          Province = provinceRecord;
        } else {
          return ctx.badRequest(
            `Province '${addressDetails.province}' not found in the database.`
          );
        }

        if (districtRecord) {
          District = districtRecord;
        } else {
          return ctx.badRequest(
            `District '${addressDetails.district}' not found in the database.`
          );
        }

        if (wardRecord) {
          Ward = wardRecord;
        } else {
          return ctx.badRequest(
            `Ward '${addressDetails.ward}' not found in the database.`
          );
        }
      } else {
        return ctx.badRequest(
          "Province, District, Ward or Location information is required."
        );
      }

      // Trả về kết quả
      ctx.send({
        message: "Conversion successful!",
        data: {
          Province,
          District,
          Ward,
          Road,
          Amenity,
        },
      });
    } catch (error) {
      strapi.log.error("Error converting location:", error);
      ctx.internalServerError("An error occurred while converting location.");
    }
  },
};

// Hàm chuẩn hóa tên tỉnh, huyện và xã (loại bỏ tiền tố như "Thành phố", "Tỉnh")
function normalizeLocationName(locationName) {
  const prefixes = ["Thành phố", "Tỉnh"];
  let normalizedName = locationName.trim();

  // Loại bỏ các tiền tố như "Thành phố", "Tỉnh"
  prefixes.forEach((prefix) => {
    if (normalizedName.startsWith(prefix)) {
      normalizedName = normalizedName.replace(prefix, "").trim();
    }
  });

  return normalizedName;
}
