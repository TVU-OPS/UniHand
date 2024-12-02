import nodemailer from 'nodemailer';

const sendEmailNotification = async (sosRequest, supportOrganization, provinceRecord, districtRecord, wardRecord) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });


  const mailOptions = {
    from: '"UniHand" <your-email@example.com>',
    to: supportOrganization.NotificationEmail,
    subject: `Thông báo: Yêu cầu hỗ trợ mới - ID: ${sosRequest.id}`,
    html: `
  <div style="display: flex; justify-content: center; margin: 10px 0px;">
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 540px; border: 1px solid #e5e7eb; border-radius: 30px; overflow: hidden;">
            <div style="padding: 12px 28px; background-color: #50bef1; border-bottom: 1px solid #ddd;">
              <h2 style="color: #fff; font-size: 16px; margin: 0px;">Thông báo từ UniHand!</h2>
            </div>
            <div style="padding: 16px 30px; font-size: 14px">
              <p style="color: #4b5563; margin: 0px">
                Kính gửi <strong style="color: #3498db; font-weight: 600">${supportOrganization.Name}</strong>,
              </p>
              <p style="color: #4b5563; margin: 4px 0px 0px 0px;">
                Yêu cầu này có thể liên quan đến một tình huống khẩn cấp cần sự hỗ trợ từ tổ chức của quý vị. </p>
              
              <div style="background-color: #f3f4f6; padding: 12px 12px; border-radius: 10px; margin-bottom: 12px; margin: 6px 0px;">
                <strong>Mã yêu cầu:</strong> <span >${sosRequest.id}</span><br>
                <strong>Họ và tên:</strong> <span>${sosRequest.FullName}</span><br>
                <strong>Số người cần hỗ trợ:</strong> <span>${sosRequest.PeopleCount || "Không rõ"}</span><br>
                <strong>Yêu cầu hỗ trợ:</strong><br>
                - Nước: <span>${sosRequest.NeedWater ? "Có" : "Không"}</span><br>
                - Thực phẩm: <span>${sosRequest.NeedFood ? "Có" : "Không"}</span><br>
                - Y tế: <span>${sosRequest.NeedMedical ? "Có" : "Không"}</span><br>
                <strong>Mô tả:</strong> <span style="display: inline-block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: calc(100% - 60px); vertical-align: middle;">${sosRequest.RequestDescription || "Không rõ"}</span><br>
                <strong>Địa chỉ:</strong> <span>${provinceRecord.FullName || "Không rõ"}, ${districtRecord.DistrictName || "Không rõ"}, ${wardRecord.WardName || "Không rõ"}${sosRequest.Road ? `, ${sosRequest.Road}` : ""}${sosRequest.Amenity ? `, ${sosRequest.Amenity}` : ""}</span><br>
                <strong>Vị trí:</strong> <span>Lat: ${sosRequest.Location?.lat || "Không rõ"}, Lng: ${sosRequest.Location?.lng || "Không rõ"}</span><br>
                <strong>Số điện thoại:</strong> <span>${sosRequest.PhoneNumber}</span><br>
                <strong>Email:</strong> <span>${provinceRecord.Email || "Không rõ"},</span>
              </div>
              
              <p style="color: #4b5563; margin: 6px 0px 0px 0px;">       
                Vui lòng đăng nhập vào hệ thống <a href="${process.env.URL_CLIENT}" style="color: #3498db; font-weight: 600;">UniHand</a> để xem thêm chi tiết và xử lý yêu cầu này.
              </p>
              
              <p style="color: #4b5563; margin: 4px 0px 0px 0px;">Chúng tôi chân thành cảm ơn sự hỗ trợ của quý vị!</p>
            </div>
            <div style="padding: 15px; background-color: #50bef1; border-top: 1px solid #ddd; text-align: center; font-weight: 550;">
              <p style="font-size: 12px; color: #fff; margin: 4px 0px 4px 0px;">UniHand | 126 Nguyễn Thiện Thành, Phường 5, Trà Vinh</p>
              <p style="font-size: 12px; color: #fff; margin: 4px 0px 4px 0px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ qua email: <a href="mailto:unihand.ops@gmail.com" style="color: #fff;">unihand.ops@gmail.com</a></p>
            </div>
          </div>
        </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    strapi.log.info(`Email sent to SOS ${sosRequest.id} for SupportOrganization ${supportOrganization.Name}`);
  } catch (error) {
    strapi.log.error(`Error sending email to ${supportOrganization.NotificationEmail}:`, error);
  }
};

export { sendEmailNotification };
