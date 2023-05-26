exports.otp_test_password = "1111";
exports.upload_dir = "/app/upload";
exports.restore_password_url =
  "https://falcon-ui.free-wood.com/auth/restore?restore_code=";

exports.fileGateUrl = "https://falcon-api.free-wood.com";

exports.b2c2_api_token = "Token 4d9cca03b72fecff06a8abb4667b2be72512d751";
exports.b2c2_host = "https://api.uat.b2c2.net";

exports.nats = {
  servers: ["nats://nats:4222"],
  json: true
};

exports.redis = {
  host: "redis",
  port: 6379
};

exports.minio = {
  endPoint: "minio",
  port: 9000,
  useSSL: false
  //accessKey: "minioadmin",
  //secretKey: "minioadmin"
};

exports.URL_TO_UI = "https://ui-dev.cr.money";

exports.NEED_TO_SEND_MESSAGES = true;
