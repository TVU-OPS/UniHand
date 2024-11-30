import { factories } from "@strapi/strapi";
import nodemailer from "nodemailer";
import { sendEmailNotification } from "../../../custom/services/email-service";
import { getLocationFromCoordinates } from "../../../custom/services/reverse-geocoding";

export default factories.createCoreController(
  "api::sos-request.sos-request",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        // Lấy ID của tỉnh từ body request
        let Province = ctx.request.body.data.Province;
        let District = ctx.request.body.data.District;
        let Ward = ctx.request.body.data.Ward;

        const { Location } = ctx.request.body.data;

        // Nếu không có ID tỉnh, thì lấy tọa độ từ body request
        if (!Province || !District || !Ward) {
          // Lấy tên tỉnh/thành phố từ tọa độ nếu không có thông tin Province
          if (Location) {
            const { lat, lng } = Location;
            const addressDetails = await getLocationFromCoordinates(lat, lng);

            // Nếu có thông tin về đường và địa điểm thì lưu
            if (addressDetails.road !== null) {
              ctx.request.body.data.Road = addressDetails.road;
            }
            if (addressDetails.amenity !== null) {
              ctx.request.body.data.Amenity = addressDetails.amenity;
            }

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
              ctx.request.body.data.Province = provinceRecord.id;
              Province = provinceRecord.id;
            } else {
              return ctx.badRequest(
                `Province '${addressDetails.province}' not found in the database.`
              );
            }

            if (districtRecord) {
              ctx.request.body.data.District = districtRecord.id;
              District = districtRecord.id;
            } else {
              return ctx.badRequest(
                `District '${addressDetails.district}' not found in the database.`
              );
            }

            if (wardRecord) {
              ctx.request.body.data.Ward = wardRecord.id;
              Ward = wardRecord.id;
            } else {
              return ctx.badRequest(
                `Ward '${addressDetails.ward}' not found in the database.`
              );
            }
          } else {
            return ctx.badRequest(
              "Province, District, Ward or Location information is required for SOSRequest."
            );
          }
        }

        // Kiểm tra xem Province, District, Ward và Location có trùng khớp không
        if (Province && District && Ward && Location) {
          const { lat, lng } = Location;
          const addressDetails = await getLocationFromCoordinates(lat, lng);

          // Nếu có thông tin về đường và địa điểm thì lưu
          if (addressDetails.road !== null) {
            ctx.request.body.data.Road = addressDetails.road;
          }
          if (addressDetails.amenity !== null) {
            ctx.request.body.data.Amenity = addressDetails.amenity;
          }

          // Chuẩn hóa tên tỉnh, huyện, xã trước khi tìm kiếm
          const normalizedProvince = normalizeLocationName(
            addressDetails.province
          );
          const normalizedDistrict = normalizeLocationName(
            addressDetails.district
          );

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

          if (
            provinceRecord.id !== Province ||
            districtRecord.id !== District ||
            wardRecord.id !== Ward
          ) {
            return ctx.badRequest(
              "Province, District, Ward và Location không trùng khớp."
            );
          }
        }

        // Tạo SOSRequest từ hàm create mặc định
        const response = await super.create(ctx);
        const sosRequest = response.data;

        // Truy xuất thông tin Province, District, Ward từ cơ sở dữ liệu
        const provinceRecord = await strapi.db
          .query("api::province.province")
          .findOne({ where: { id: Province } });

        const districtRecord = await strapi.db
          .query("api::district.district")
          .findOne({ where: { id: District } });

        const wardRecord = await strapi.db
          .query("api::ward.ward")
          .findOne({ where: { id: Ward } });

        // Tìm tất cả các SupportOrganization có Province trùng với SOSRequest
        const supportOrganizations = await strapi.db
          .query("api::support-organization.support-organization")
          .findMany({
            where: {
              Province: Province, // Tìm kiếm theo ID tỉnh
            },
          });

        // Nếu không tìm thấy SupportOrganization, tức là không có tổ chức nào hỗ trợ ở tỉnh này
        if (supportOrganizations.length === 0) {
          strapi.log.info(
            `No SupportOrganization found for Province ID: ${Province}`
          );
        }

        // Tạo một Notification cho mỗi SupportOrganization tìm thấy và gửi email
        for (const supportOrganization of supportOrganizations) {
          // Tạo Notification
          await strapi.service("api::notification.notification").create({
            data: {
              SOSRequest: sosRequest.id, // Liên kết với SOSRequest
              SupportOrganization: supportOrganization.id, // Liên kết với SupportOrganization
            },
          });

          strapi.log.info(
            `Notification created for SOSRequest ID: ${sosRequest.id}, SupportOrganization ID: ${supportOrganization.id}`
          );

          await sendEmailNotification(
            sosRequest,
            supportOrganization,
            provinceRecord, // Truyền Province record vào
            districtRecord, // Truyền District record vào
            wardRecord // Truyền Ward record vào
          );
        }
        // Trả về response của SOSRequest
        return response;
      } catch (error) {
        strapi.log.error("Error creating SOSRequest or Notifications:", error);
        return ctx.internalServerError(
          "An error occurred while creating SOSRequest and Notifications"
        );
      }
    },
  })
);

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
