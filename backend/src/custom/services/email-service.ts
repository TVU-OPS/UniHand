import nodemailer from 'nodemailer';

const sendEmailNotification = async (email, sosRequest, supportOrganization) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"UniHand" <your-email@example.com>',
    to: email,
    subject: `Thông báo: Yêu cầu hỗ trợ mới - ID: ${sosRequest.id}`,
    html: `
     <div style="display: flex; justify-content: center; margin: 30px 0px;">
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 540px; border: 1px solid #e5e7eb; border-radius: 30px; overflow: hidden;">
        <div style="padding: 6px 28px; background-color: #50bef1; border-bottom: 1px solid #ddd;">
          <h2 style="color: #ffff; font-size: 16px">Thông báo từ UniHand!</h2>
        </div>
        <div style="padding: 6px 30px; font-size: 16px">
          <p style="color: #4b5563">Kính gửi <strong style="color: #111" >${supportOrganization.Name}</strong>,</p>
        	
            <div style="background-color: #f3f4f6; padding: 8px 14px; border-radius: 10px;">
            <strong>Mã yêu cầu: </strong><span style="color: #f74646; font-weight: 600;">${sosRequest.id}</span><br>
            <strong>Mô tả:</strong> <span style="color: #4b5563"> ${sosRequest.description || "Không có mô tả chi tiết"} </span>
            </div>
            
          </p>
          <p style="color: #4b5563">
            Yêu cầu này có thể liên quan đến một tình huống khẩn cấp cần sự hỗ trợ từ tổ chức của quý vị.
            Vui lòng đăng nhập vào hệ thống <a href="https://your-website.com" style="color: #3498db; font-weight: 600;">UniHand</a> để xem thêm chi tiết và xử lý yêu cầu này.
          </p>
          <p style="color: #4b5563;">Chúng tôi chân thành cảm ơn sự hỗ trợ của quý vị!</p>
        </div>
        <div style="padding: 15px; background-color: #50bef1; border-top: 1px solid #ddd; text-align: center; font-weight: 550; " >
          <p style="font-size: 12px; color: #ffff;">UniHand | 126 Nguyễn Thiện Thành, Phường 5, Trà Vinh</p>
          <p style="font-size: 12px; color: #ffff;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ qua email: <a href="mailto:unihand.ops@gmail.com" style="color: #ffff;">unihand.ops@gmail.com</a></p>
        </div>
      </div>
</div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    strapi.log.info(`Email sent to ${email} for SupportOrganization ${supportOrganization.Name}`);
  } catch (error) {
    strapi.log.error(`Error sending email to ${email}:`, error);
  }
};

export { sendEmailNotification };
