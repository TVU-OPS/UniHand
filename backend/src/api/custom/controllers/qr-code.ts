const QRCode = require('qrcode');

module.exports = {
  async generate(ctx) {
    const { text } = ctx.query;

    if (!text) {
      return ctx.badRequest("Vui lòng cung cấp 'text' trong query!");
    }

    try {
      ctx.set('Content-Type', 'image/png'); // Đặt tiêu đề Content-Type
      ctx.body = await QRCode.toBuffer(text, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000', // Màu mã QR
          light: '#ffffff', // Màu nền
        },
      });
    } catch (err) {
      strapi.log.error(err);
      return ctx.internalServerError('Lỗi khi tạo mã QR!');
    }
  },
};