import { getLocationFromCoordinates } from "../../../custom/services/reverse-geocoding";

const axios = require("axios");

module.exports = {
  async handleConvert(ctx) {
    try {
      const { Location } = ctx.request.body.data;
      let provinceRecord = null;
      let districtRecord = null;
      let wardRecord = null;
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

        if (
          !addressDetails.province ||
          !addressDetails.district ||
          !addressDetails.ward
        ) {
          return ctx.badRequest(
            `Province ${addressDetails.province} or District ${addressDetails.district} or Ward ${addressDetails.ward} not found.`
          );
        }

        // Chuẩn hóa tên tỉnh, huyện, xã trước khi tìm kiếm
        const normalizedProvince = normalizeProvinceName(
          addressDetails.province
        );
        const normalizedDistrict = normalizeDistrictName(
          addressDetails.district
        );
        const normalizedWard = normalizeWardName(addressDetails.ward);

        // Tìm kiếm trong cơ sở dữ liệu để lấy id của tỉnh, huyện và xã theo tên
        provinceRecord = await strapi.db
        .query("api::province.province")
          .findOne({
            where: {
              $or: [
                { FullName: { $eq: normalizedProvince } }, // Bằng chính xác
                { FullName: { $contains: normalizedProvince } }, // Chứa chuỗi con
                { Name: { $eq: normalizedProvince } }, // Bằng chính xác
                { Name: { $contains: normalizedProvince } }, // Chứa chuỗi con
              ],
            },
          });
          districtRecord = await strapi.db
          .query("api::district.district")
          .findOne({
            where: {
              $and: [
                {
                  Province: provinceRecord.id, // Kiểm tra thuộc quận
                },
                {
                  $or: [
                    { FullName: { $eq: normalizedDistrict } }, // Bằng
                    { FullName: { $contains: normalizedDistrict } }, // Chứa
                    { Name: { $eq: normalizedDistrict } }, // Bằng chính xác
                    { Name: { $contains: normalizedDistrict } }, // Chứa chuỗi con
                  ],
                },
              ]
            },
          });
          wardRecord = await strapi.db.query("api::ward.ward").findOne({
            where: {
              $and: [
                {
                  District: districtRecord.id, // Kiểm tra thuộc quận
                },
                {
                  $or: [
                    { FullName: { $eq: normalizedWard } }, // Bằng
                    { FullName: { $contains: normalizedWard } }, // Chứa
                    { Name: { $eq: normalizedWard } }, // Bằng chính xác
                    { Name: { $contains: normalizedWard } }, // Chứa chuỗi con
                  ],
                },
              ]
            },
          });


        if (provinceRecord) {
          provinceRecord = provinceRecord;
        } else {
          return ctx.badRequest(
            `Province '${addressDetails.province}' not found in the database.`
          );
        }

        if (districtRecord) {
          districtRecord = districtRecord;
        } else {
          return ctx.badRequest(
            `District '${addressDetails.district}' not found in the database.`
          );
        }

        if (wardRecord) {
          wardRecord = wardRecord;
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
          Province: provinceRecord,
          District: districtRecord,
          Ward: wardRecord,
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
function normalizeProvinceName(locationName) {
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
function normalizeDistrictName(locationName) {
  const prefixes = ["Quận", "Huyện", "Thị xã"];
  let normalizedName = locationName.trim();

  // Loại bỏ các tiền tố như "Quận", "Huyện", "Thị xã"
  prefixes.forEach((prefix) => {
    if (normalizedName.startsWith(prefix)) {
      normalizedName = normalizedName.replace(prefix, "").trim();
    }
  });

  return normalizedName;
}

function normalizeWardName(wardName) {
  const prefixes = ["Phường", "Xã", "Thị trấn"];
  let normalizedName = wardName.trim();

  // Loại bỏ các tiền tố như "Phường", "Xã"
  prefixes.forEach((prefix) => {
    if (normalizedName.startsWith(prefix)) {
      normalizedName = normalizedName.replace(prefix, "").trim();
    }
  });

  return normalizedName;
}
