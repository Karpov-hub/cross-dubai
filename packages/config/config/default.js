exports.port = 8008;
exports.fileGatePort = 8012;
exports.apiVersion = "0.1.1";

exports.queueName = "falcon";

exports.realmToken = "{realmToken}";
exports.nats = {
  servers: ["nats://localhost:4222"],
  json: true
};
exports.upload_dir = __dirname + "/../../../upload";
exports.otp_timeout = 3000; // otp lifetime in seconds
exports.otp_message =
  "{otp} is a one-time password to complete the operation. Do not share this code with anyone.";
exports.otp_attempts = 30;
exports.otp_test_password = "111111";
exports.restore_password_url =
  "http://192.168.0.126:8008/auth/restore?restore_code=";

exports.baseUrl = "http://localhost:8008";

exports.user_token_lifetime = 3600; // user's token lifetime in seconds

exports.addWatermark = false;

exports.apiURL = "http://localhost:8008";
exports.fileGateUrl = "http://localhost:8012";

exports.merchantServerPort = 8011;

exports.minio = {
  endPoint: "127.0.0.1",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadmin"
};
exports.fileProviderType = "minio";

exports.REALM_TOKEN =
  "e7fc7f94b7ab7f18e37bde3a8a26c42e519e3719ec50857ff5b97395d583f075"; // token for merchant endpoint

exports.sumsub = {
  base_url: "https://test-api.sumsub.com",
  user: "onboarding", //"test",
  password: "ddGe#4ff_1", //"test",
  ttlInSecs: 600,
  applicant: {
    email: "",
    requiredIdDocs: {
      docSets: [
        {
          idDocSetType: "IDENTITY",
          types: ["ID_CARD", "PASSPORT", "DRIVERS", "RESIDENCE_PERMIT"]
        },
        {
          idDocSetType: "SELFIE",
          types: ["SELFIE"],
          videoRequired: "liveness"
        }
      ]
    }
  }
};

exports.smsGateUrl =
  "https://smsc.ru/sys/send.php?login=novatum&psw=4e@jXsf5cAi5EC6&phones={phone}&mes={text}";

exports.cryptoMasterKey = "FCYuMTY1LjI0NS4yMjE";

exports.validateSchemas = true;
exports.logs = "enabled";

exports.b2c2_api_token = "Token ae46611047c2530e4e5a669982dcacf26f194917";
exports.b2c2_host = "http://localhost:8010/nil"; //"https://api.uat.b2c2.net";

exports.destination_address = {
  address_value: "0x78B22647d0366E2a1E4f5f6F7293F00E6F20acB1",
  address_suffix: "tag0"
};

exports.userTestPassword = "Passw0rd";
exports.gateServerURL = "http://localhost:8008/";

exports.allowDeleteOrdersAndTransfers = true;
exports.queueTimeout = 20000;

exports.paymentCheckerCron = "* * * * * *";

exports.nilLimitInUSD = 25000;

exports.coinexAttempts = 10;
exports.coinexPauseBetweenAttempts = 1000;

exports.jasperURL = "http://65.2.180.176:6543";
exports.ittechavURL = "https://app.ittechav.com"; // http://207.246.89.87:8089

exports.CURRENCY_ALIAS = {
  USTR: "TRX_USDT"
};

exports.telegram_bot_token = "5224757980:AAFZE1qkMteBnugXQ1o1H9WZacSABygrDIY";

exports.swap = {
  endpoint: "http://localhost:8010/coinex/api/v1/",
  secretKey: "o2zqolVoFRhqZ7AuWR7XADiLms6Yo0vUgRereRc7yEHd5Mqt8T7zMBaBlw0avRJQ",
  auth: {
    username: "kr103+fcmerchant@enovate-it.com",
    password: "Passw0rd@18"
  }
};
exports.NIL_RATES_INSTRUMENTS = [
  {
    currency_from: "EUR",
    currency_to: "USDT"
  },
  {
    currency_from: "USD",
    currency_to: "USDT"
  },
  {
    currency_from: "USDT",
    currency_to: "EUR"
  },
  {
    currency_from: "USDT",
    currency_to: "USD"
  }
  // {
  //   currency_from: "EUR",
  //   currency_to: "BTC"
  // },
  // {
  //   currency_from: "USD",
  //   currency_to: "BTC"
  // },
  // {
  //   currency_from: "BTC",
  //   currency_to: "EUR"
  // },
  // {
  //   currency_from: "BTC",
  //   currency_to: "USD"
  // }
];
exports.CRYPTO_CURRENCY_VALIDATION_ALIAS = {
  DOG: "doge",
  USDT: "ETH",
  USTR: "TRX",
  USDC: "ETH"
};

exports.VALIDATOR_NETWORK_TYPE = "both";

exports.URL_TO_UI = "http://localhost:8080";

exports.ENABLE_NIL_RATE_HISTORY = false;

exports.NEED_TO_SEND_MESSAGES = true;

exports.RESTORE_PASS_CODE_LIFETIME = 600;

exports.IS_TEST = ["localtest", "test"].includes(process.env.NODE_ENV);

exports.SYSTEM_NOTIFICATIONS_RECEIVER = "notify@cr.money";

exports.NF_CORRECTION_FACTOR = 5;
