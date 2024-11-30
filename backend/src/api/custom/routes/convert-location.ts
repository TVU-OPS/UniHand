module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/convert-location',
        handler: 'convert-location.handleConvert',
        config: {
          auth: false, 
        },
      },
    ],
  };
  