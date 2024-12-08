module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/qr-code',
      handler: 'qr-code.generate',
      config: {
        auth: false, 
      },
    },
  ],
};
