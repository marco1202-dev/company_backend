module.exports = {
  apps: [
    {
      name: "server",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    }
  ]
};