import { factories } from "@strapi/strapi";
import nodemailer from "nodemailer";
import { sendEmailNotification } from "../../../custom/services/email-service";
import { getLocationFromCoordinates } from "../../../custom/services/reverse-geocoding";

export default factories.createCoreController(
  "api::sos-request.sos-request",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        // TH1: Có tỉnh, huyện, xã, location thì lưu vào db (không cần check tỉnh, huyện, xã có trùng location)
        // TH2: Không có tỉnh, huyện, xã mà có location
        //      + Convert location => thành công => lưu vào db
        //      + Convert location => thất bại => kêu cung cấp tỉnh, huyện, xã (vì có thể lỗi do convert nhưng location vẫn sử dụng được);
        // TH3: Có tỉnh huyện xã, không có location => lưu tỉnh huyện xã, còn location null
        // TH4: Không có tỉnh, huyện, xã, location => báo lỗi

        // Lấy ID của tỉnh từ body request
        let Province = ctx.request.body.data.Province;
        let District = ctx.request.body.data.District;
        let Ward = ctx.request.body.data.Ward;
        const { Location } = ctx.request.body.data;

        let provinceRecord = null;
        let districtRecord = null;
        let wardRecord = null;

        // Không có tỉnh, huyện, xã
        if (!Province || !District || !Ward) {
          //// TH4: Không có tỉnh, huyện, xã, không location
          if (!Location) {
            return ctx.badRequest("Vui lòng nhập tỉnh, huyện, xã, location");
          }

          //// TH2: Không có tỉnh, huyện, xã, có location
          const { lat, lng } = Location;
          const addressDetails = await getLocationFromCoordinates(lat, lng);

          // + Convert location => không thành công => báo lỗi
          if (
            !addressDetails.province ||
            !addressDetails.district ||
            !addressDetails.ward
          ) {
            return ctx.badRequest(
              "Không thể chuyển Location Province, District, Ward. Vui lòng nhập thêm ID tỉnh, huyện, xã."
            );
          }

          // + Convert location => thành công => lưu vào db
          // Nếu có thêm thông tin về đường và địa điểm thì lưu
          if (addressDetails.road !== null) {
            ctx.request.body.data.Road = addressDetails.road;
          }
          if (addressDetails.amenity !== null) {
            ctx.request.body.data.Amenity = addressDetails.amenity;
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
                ProvinceName: {
                  $contains: normalizedProvince,
                },
              },
            });
          districtRecord = await strapi.db
            .query("api::district.district")
            .findOne({
              where: {
                DistrictName: {
                  $contains: normalizedDistrict,
                },
                Province: provinceRecord.id,
              },
            });
          wardRecord = await strapi.db.query("api::ward.ward").findOne({
            where: {
              WardName: {
                $contains: normalizedWard,
              },
              District: districtRecord.id,
            },
          });

          // Nếu tìm thấy tỉnh, huyện, xã theo convert Location thì lưu vào body request
          // để thay thế có tỉnh, huyện, xã không có. Không tìm dược => convert thất bại => báo lỗi
          if (provinceRecord && districtRecord && wardRecord) {
            ctx.request.body.data.Province = provinceRecord.id;
            ctx.request.body.data.District = districtRecord.id;
            ctx.request.body.data.Ward = wardRecord.id;
            Province = provinceRecord.id;
            Ward = wardRecord.id;
            District = districtRecord.id;
          } else {
            return ctx.badRequest(
              `Province or District or Ward không tồn tại trong hệ thống. Vui lòng nhập ID tỉnh, huyện, xã.`
            );
          }
        }

        //// Tạo SOSRequest từ hàm create mặc định
        const response = await super.create(ctx);
        const sosRequest = response.data;

        // Tìm tất cả các SupportOrganization có Province trùng với SOSRequest
        const provinceSend = provinceRecord?.id || Province;
        const supportOrganizations = await strapi.db
          .query("api::support-organization.support-organization")
          .findMany({
            where: {
              Province: provinceSend,
            },
          });

        // Nếu không tìm thấy SupportOrganization, tức là không có tổ chức nào hỗ trợ ở tỉnh này
        if (supportOrganizations.length === 0) {
          strapi.log.info(
            `No SupportOrganization found for Province ID: ${Province}`
          );
        } else {
          // Lấy thông tin tỉnh, huyện, xã để điền vào email
          const provinceEmail = Province || provinceRecord?.id;
          const province = await strapi.db
            .query("api::province.province")
            .findOne({ where: { id: provinceEmail } });

          const districtEmail = District || districtRecord?.id;
          const district = await strapi.db
            .query("api::district.district")
            .findOne({ where: { id: districtEmail } });

          const wardEmail = Ward || wardRecord?.id;
          const ward = await strapi.db
            .query("api::ward.ward")
            .findOne({ where: { id: wardEmail } });
          // Duyệt danh sách SupportOrganization để tạo thông báo và gửi email
          for (const supportOrganization of supportOrganizations) {
            await strapi.service("api::notification.notification").create({
              data: {
                SOSRequest: sosRequest.id,
                SupportOrganization: supportOrganization.id,
              },
            });

            await sendEmailNotification(
              sosRequest,
              supportOrganization,
              province,
              district,
              ward
            );
          }
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