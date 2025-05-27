module.exports = {
  lintOnSave: false,
  devServer: {
    https: false,
    host: "localhost",
    port: 8081,
    client: {
      webSocketURL: "ws://localhost:8081/ws",
    },
    allowedHosts: "all",
  },
};
