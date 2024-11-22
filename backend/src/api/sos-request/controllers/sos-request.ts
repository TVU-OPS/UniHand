import { factories } from "@strapi/strapi";
import nodemailer from "nodemailer";
import { sendEmailNotification } from "../../../custom/services/email-service";

export default factories.createCoreController(
  "api::sos-request.sos-request",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        // Tạo SOSRequest từ hàm create mặc định
        const response = await super.create(ctx);
        const sosRequest = response.data;

        const Province = ctx.request.body.data.Province;
        if (!Province) {
          return ctx.badRequest("Province is required for SOSRequest.");
        }

        // Tìm tất cả các OrganizationAddress có Province trùng với SOSRequest
        const organizationAddresses = await strapi.db
          .query("api::organization-address.organization-address")
          .findMany({
            where: {
              Province: Province,
            },
            populate: ["SupportOrganization"],
          });

        // Nếu không tìm thấy SupportOrganization, tức là không có tổ chức nào hỗ trợ ở tỉnh này
        if (organizationAddresses.length === 0) {
          strapi.log.info(
            `No SupportOrganization found for Province ID: ${Province}`
          );
        }

        // Tạo một Notification cho mỗi SupportOrganization tìm thấy và gửi email
        for (const address of organizationAddresses) {
          const supportOrganization = address.SupportOrganization;

          if (supportOrganization) {
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

            // Lấy thông tin liên hệ của SupportOrganization từ bảng contact_infos
            const contactInfo = await strapi.db
              .query("api::contact-info.contact-info")
              .findOne({
                where: {
                  SupportOrganization: supportOrganization.id,
                  ContactType: "email",
                },
              });

            if (contactInfo && contactInfo.ContactValue) {
              // Gửi email thông báo cho tổ chức hỗ trợ
              await sendEmailNotification(
                contactInfo.ContactValue,
                sosRequest,
                supportOrganization
              );
            } else {
              strapi.log.warn(
                `No valid contact info found for SupportOrganization ID: ${supportOrganization.id}`
              );
            }
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
