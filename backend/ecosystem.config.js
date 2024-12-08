module.exports = {
  apps: [
    {
      name: "UniHand",
      script: "npm",
      args: "run start:pro",
      cwd: "./",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
