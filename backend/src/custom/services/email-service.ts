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
    from: 'UniHand',
    to: email,
    subject: `Thông báo về yêu cầu SOS mới`,
    text: `Kính gửi ${supportOrganization.Name},\n\nChúng tôi xin trân trọng thông báo rằng một yêu cầu SOS mới đã được tạo trong hệ thống của chúng tôi với mã ID: ${sosRequest.id}.
    \nYêu cầu này có thể liên quan đến một tình huống khẩn cấp cần sự hỗ trợ của ${supportOrganization.Name}
    \nVui lòng kiểm tra hệ thống của UniHand để biết thêm chi tiết.
    \n\nTrân trọng,\nUniHand`,
  };

  try {
    await transporter.sendMail(mailOptions);
    strapi.log.info(`Email sent to ${email} for SupportOrganization ${supportOrganization.Name}`);
  } catch (error) {
    strapi.log.error(`Error sending email to ${email}:`, error);
  }
};

export { sendEmailNotification };
