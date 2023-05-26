exports.otp_test_password = "1111";
exports.upload_dir = "/home/ec2-user/upload";

exports.fileGateUrl = "https://api.falcontransfer.com";

exports.nats = {
  servers: ["nats://172.31.5.91:5221"],
  json: true
};

exports.redis = {
  host: "172.31.5.91",
  port: 6380
};

exports.b2c2_api_token = "Token ae46611047c2530e4e5a669982dcacf26f194917";
exports.b2c2_host = "http://localhost:8010/nil"; //"https://api.uat.b2c2.net";

exports.minio = {
  endPoint: "172.31.5.91",
  port: 9000,
  useSSL: false
  //accessKey: "minioadmin",
  //secretKey: "minioadmin"
};

exports.paymentCheckerCron = "*/5 * * * *";
exports.telegram_bot_token = "5248199894:AAESTAnlnDyIrh_ChwTRbqeYiJqLyCzjZHw";

exports.swap = {
  endpoint: "http://172.31.43.74:9090/coinex/api/v1/",
  secretKey: "o2zqolVoFRhqZ7AuWR7XADiLms6Yo0vUgRereRc7yEHd5Mqt8T7zMBaBlw0avRJQ",
  auth: {
    username: "soman@falcontransfer.com",
    password: "$b6h27Jro"
  }
};
exports.VALIDATOR_NETWORK_TYPE = "prod";

exports.URL_TO_UI = "https://www.cr.money";

exports.NEED_TO_SEND_MESSAGES = true;
