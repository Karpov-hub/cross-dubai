/**
 * Class Request incapsules separate request
 */
console.log("NODE_ENV", process.env.NODE_ENV);

import config from "@lib/config";
import Queue from "@lib/queue";
import MemStore from "@lib/memstore";
import ipLib from "ip";
import FileProvider from "@lib/fileprovider";
import { ERROR_MESSAGES } from "./Error";
import PublicMethods from "./Public";

const MAX_SIZE = config.limit_size || 1024 * 1024 * 5;
const MAX_QUEUE_SIZE = 1024 * 500;

export default class Request {
  constructor(request, responce, next, server) {
    this.request = request;
    this.responce = responce;
    this.requestId = null;
    this.next = next;
    this.server = server;
  }

  error(code, errorReport) {
    if (this.isSent) return;
    this.isSent = true;
    //if (!!errorReport) console.error(errorReport);

    this.responce.send({
      header: {
        id: this.requestId,
        status: "ERROR"
      },
      error: {
        code: typeof code === "object" ? "UNKNOWN" : code,
        message: ERROR_MESSAGES[code] || "Undefined",
        object:
          typeof code === "object"
            ? JSON.stringify(code, null, 4)
            : errorReport || null
      }
    });
  }

  send(data) {
    if (this.isSent) return;
    this.isSent = true;
    this.responce.send({
      header: {
        id: this.requestId,
        status: "OK"
      },
      data
    });
  }

  checkSize(data) {
    if (!data) return true;
    const size = JSON.stringify(data).length;
    return size <= MAX_QUEUE_SIZE;
  }

  async checkNonce(nonce) {
    const res = await MemStore.get(`nonce:${nonce}`);
    if (res) return true;
    await MemStore.set(`nonce:${nonce}`, 1, 3);
    return false;
  }

  async run() {
    let size = this.request.headers["content-length"];

    if (size > MAX_SIZE) throw "STACKOVERFLOW";
    if (/\/rest\//.test(this.request.path))
      return await this.do(this.transformRestRequest());

    return await this.do(this.request.body);
  }

  transformRestRequest() {
    const path = this.request.path.split("/");

    if (path[path.length - 1] && path[path.length - 2]) {
      if (this.request.query.bearer) {
        this.request.headers.authorization =
          "bearer" + this.request.query.bearer;
      }
      return {
        header: {
          id: this.request.query.id,
          lang: this.request.query.lang || "eng",
          version: this.request.query.version,
          service: path[path.length - 2],
          method: path[path.length - 1],
          nonce: this.request.query.nonce || "",
          token: this.request.query.token || null
        },
        data: this.request.body
      };
    }
    throw "RESTREQUESTFORMATERROR";
  }

  validateSchema(data, scheme) {
    const res = this.server.schemaValidator.validate(
      data.data,
      scheme
      //"/" + data.header.service + "_" + data.header.method
    );
    if (!res.errors || !res.errors.length) return true;
    return res.errors;
  }

  async addLogForRequest(request, responce) {
    //if (!(await PublicMethods.logsStatus())) return;
  }

  async do(data) {
    let server, userId;

    server = await this.checkServerToken(
      this.request.headers.authorization || ""
    );

    data.realm = server.id;

    if (server.cors && server.cors._arr) {
      await this.server.cors(server.cors._arr, this.request, this.responce);
    } else {
      await this.server.cors(
        [{ option: "origin", value: "*" }],
        this.request,
        this.responce
      );
    }

    if (!this.checkInputData(data)) return;

    if (data.header.nonce && (await this.checkNonce(data.header.nonce))) {
      this.addLogForRequest(data, { error: "ERRORNONCE" });
      return this.error("ERRORNONCE");
    }
    
    if (!this.server.services[data.header.service]) {
      this.addLogForRequest(data, {
        error: "SERVICENOTFOUND:" + data.header.service
      });
      return this.error("SERVICENOTFOUND:" + data.header.service);
    }

    if (!this.server.services[data.header.service][data.header.method]) {
      this.addLogForRequest(data, {
        error:
          "METHODNOTFOUND:" + data.header.service + "." + data.header.method
      });
      return this.error(
        "METHODNOTFOUND:" + data.header.service + "." + data.header.method
      );
    }

    if (this.server.services[data.header.service][data.header.method].realm) {
      server = await this.checkServerPermissions(
        server,
        this.request.headers.authorization,
        data.header
      );

      if (!server) return;

      if (server.ip && !this.checkRequestIp(server.ip, this.request)) {
        this.addLogForRequest(data, {
          error: "ACCESSDENIEDFORIP"
        });
        return this.error("ACCESSDENIEDFORIP");
      }

      if (
        server.domain &&
        !this.checkRequestDomain(server.domain, this.request)
      ) {
        this.addLogForRequest(data, {
          error: "WRONGREALMHOST"
        });
        return this.error("WRONGREALMHOST");
      }
    }

    if (
      config.validateSchemas &&
      this.server.services[data.header.service][data.header.method].schema
    ) {
      const validateResult = this.validateSchema(
        data,
        this.server.services[data.header.service][data.header.method].schema
      );
      if (validateResult !== true) {
        this.addLogForRequest(data, {
          error: "INVALIDSCHEMA:" + validateResult
        });
        return this.error("INVALIDSCHEMA", validateResult);
      }
    }

    if (this.server.services[data.header.service][data.header.method].user) {
      userId = await this.checkUserPermissions(data);
      if (!userId) {
        this.addLogForRequest(data, {
          error: "ACCESSDENIEDFORUSER"
        });
        return this.error("ACCESSDENIEDFORUSER");
      }
      if (
        this.server.services[data.header.service][data.header.method].kyc &&
        !(await this.checkUserKyc(userId))
      ) {
        this.addLogForRequest(data, {
          error: "KYCREQUIRED"
        });
        return this.error("KYCREQUIRED");
      }
    }

    if (data.data && data.data.files && Array.isArray(data.data.files)) {
      data.data.files = await this.prepareFiles(data.data.files);
    }

    if (!this.checkSize(data.data)) {
      this.addLogForRequest(data, {
        error: "STACKOVERFLOW"
      });
      return this.error("STACKOVERFLOW");
    }

    if (
      this.server.services[data.header.service][data.header.method].otp &&
      !data.data.test
    ) {
      data.userId = userId;
      data.realmId = server.pid || server.id;
      return await this.sendOtp(data);
    }
    const resultData = await this.doJob(
      data.header.service,
      data.header.method,
      data.data,
      server ? server.pid || server.id : null,
      userId,
      this.request.headers,
      data.header
    );
    if (resultData) {
      if (data.data && data.data.files) {
        await FileProvider.accept(data.data.files);
      }
      this.addLogForRequest(data, resultData);
      this.send(resultData);
    } else {
      if (data.data && data.data.files)
        await this.removeTemplatedFiles(data.data.files);
    }
  }

  checkRequestIp(allowedIP, request) {
    const ip =
      request.headers["x-real-ip"] ||
      request.headers["x-forwarded-for"] ||
      request.connection.remoteAddress;

    if (!ip) return false;
    return ipLib.isEqual(ip, allowedIP);
  }

  checkRequestDomain(allowedDomain, request) {
    let host = request.headers["origin"];
    if (!host) return false;
    host = host.split("/")[2];
    return host == allowedDomain;
  }

  checkInputData(data) {
    if (!data || typeof data !== "object" || !this.checkHeader(data.header)) {
      this.addLogForRequest(data, { error: "INPDATAFORMAT" });
      return this.error("INPDATAFORMAT");
    }

    if (!this.checkVersion(data.header.version)) {
      this.addLogForRequest(data, { error: "VERSION" });
      return this.error("VERSION");
    }

    return true;
  }

  checkHeader(header) {
    if (!header) return false;
    if (!header.version) return false;
    if (!header.service) return false;
    if (!header.method) return false;
    this.requestId = header.id;
    return true;
  }

  checkVersion(version) {
    return config.apiVersion == version;
  }

  async checkServerPermissions(serverObject, token, header) {
    if (
      serverObject &&
      this.checkServicePermissions(serverObject, header.service, header.method)
    ) {
      return serverObject;
    }
    this.addLogForRequest(null, {
      error: "SERVERACCESSDENIED"
    });
    return this.error("SERVERACCESSDENIED");
  }

  checkServicePermissions(server, service, method) {
    return (
      server.permissions &&
      server.permissions[service] &&
      server.permissions[service][method]
    );
  }

  async checkServerToken(token) {
    let serverObject, res;
    const tokenCode = token.replace(/bearer/i, "").trim();
    try {
      res = await MemStore.get(`srv${tokenCode}`);
      serverObject = JSON.parse(res);
    } catch (e) {
      return false;
    }

    if (!serverObject) {
      serverObject = await this.getServerByToken(tokenCode);
      if (serverObject) {
        await MemStore.set(`srv${tokenCode}`, JSON.stringify(serverObject));
      }
    }
    return serverObject || false;
  }

  async checkUserKyc(id) {
    const resultData = await this.doJob("auth-service", "getUserKycStatus", {
      id
    });
    return !!resultData.kyc;
  }

  // get server id by token in db
  async getServerByToken(token) {
    const resultData = await this.doJob("auth-service", "getServerByToken", {
      token
    });

    if (!resultData || !resultData.id) return null;
    return resultData;
  }

  checkUserIP(IPs) {
    if (!IPs || IPs == "undefined") return true;
    if (!IPs || !this.request.headers["x-real-ip"]) return true;
    for (let ip of IPs.split(",")) {
      if (ipLib.isEqual(this.request.headers["x-real-ip"], ip)) return true;
    }
    return false;
  }

  async checkUserPermissions(data) {
    // check authorized user by token
    const key = `usr${data.header.token}`;
    const userRec = await MemStore.get(key);
    if (!userRec) return null;
    const rec = userRec.split("|");

    if (rec[0] && this.checkUserIP(rec[1])) {
      await MemStore.set(key, userRec, config.user_token_lifetime);
      return rec[0];
    } else {
      await MemStore.del(key);
    }
    return null;
  }

  async doJob(
    service,
    method,
    data,
    realmId,
    userId,
    requestHeaders,
    dataHeaders
  ) {
    const res = await Queue.newJob(service, {
      method,
      data,
      realmId,
      userId,
      scope: "gate",
      requestHeaders,
      dataHeaders
    });

    if (res.error) {
      this.error(res.error);
      return null;
    } else {
      return res.result;
    }
  }

  async prepareFiles(files) {
    let fileData,
      out = [];
    try {
      for (let i = 0; i < files.length; i++) {
        fileData = await FileProvider.push(
          files[i],
          config.new_file_hold_timeout || 300
        );
        if (fileData && fileData.success) {
          out.push({
            name: files[i].name,
            code: fileData.code,
            size: fileData.size
          });
        }
      }
    } catch (e) {
      this.error("FILEUPLOADERROR1");
    }
    return out;
  }

  async removeTemplatedFiles(files) {
    for (let i = 0; i < files.length; i++) {
      await FileProvider.del(files[i].data);
    }
  }

  async sendOtp(data) {
    const resultData = await this.doJob("auth-service", "otp", data);
    resultData.operation = data.data;
    this.send(resultData);
  }
}
