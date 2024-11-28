module.exports = {
  routes: [
    {
      method: "GET",
      path: "/organization/:id",
      handler: "api::support-organization.support-organization.findOne",
      config: {
        auth: false,
      },
    },
  ],
};
