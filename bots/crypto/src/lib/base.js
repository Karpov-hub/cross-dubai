export default class Base {
  constructor() {
    this.compilledTpl = {};
    return async (res, req, done) => {
      await this.serve(res, req);
      //done();
    };
  }

  send(res, data) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  }

  sendError(res, code, message) {
    res.statusCode = code;
    res.setHeader("Content-Type", "application/json");
    res.send({ code, message });
  }

  getHash(string, key) {
    var hmac = crypto.createHmac("sha256", key);
    hmac.update(string);
    return hmac.digest("binary");
  }

  async parseSignedData(inputData) {
    if (!inputData.data || !inputData.sign) return null;
    let sign = new Buffer(inputData.sign, "base64");
    let buff = new Buffer(inputData.data, "base64");
    let data;

    try {
      data = JSON.parse(buff.toString("utf-8"));
    } catch (e) {}
    if (!data.merchant) return null;

    const secret = await this.getSecretByMerchantId(data.merchant);

    if (!secret) return null;
    if (this.getHash(inputData.data, secret) == sign) {
      return data;
    }
    return null;
  }
}
