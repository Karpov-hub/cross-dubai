import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import pretest from "@lib/pretest";
import doc from "@lib/chai-documentator";
import config from "@lib/config";

chai.use(require("chai-like"));
chai.use(require("chai-things"));

async function sendRequest(data, doDoc) {
  if (doDoc !== false)
    return await doc(
      chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );

  return await chai
    .request(server)
    .post("/")
    .set("Origin", "http://" + realmHost)
    .set("content-type", "application/json")
    .set("authorization", "bearer" + realmToken)
    .send(data);
}

const expect = chai.expect;

let userToken;
global.realmHost = "test.realm";

chai.use(chaiHttp);

describe("Callback service methods", async () => {
  before(async () => {
    userToken = global.userToken;
    config.realmToken = realmToken;
    config.realmToken.replace("{realmToken}", realmToken);
  });
  after(async () => {});

  describe("Set transfer status", async () => {
    it("Set transfer status to processed", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "callback-service",
          method: "setProcessed",
          token: userToken
        },
        data: {
          id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
    });
    it("Set transfer status to refund", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "callback-service",
          method: "setRefund",
          token: userToken
        },
        data: {
          id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });
    it("Set transfer status to canceled", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "callback-service",
          method: "setCanceled",
          token: userToken
        },
        data: {
          id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6"
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });
  });
});
