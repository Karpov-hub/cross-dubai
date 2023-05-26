import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import pretest from "@lib/pretest";
import doc from "@lib/chai-documentator";
import config from "@lib/config";

chai.use(require("chai-like"));
chai.use(require("chai-things"));

const expect = chai.expect;

let userToken;
global.realmHost = "test.realm";

chai.use(chaiHttp);

describe("Statement service methods", async () => {
  before(async () => {
    userToken = global.userToken;
    config.realmToken = realmToken;
    config.realmToken.replace("{realmToken}", realmToken);
  });
  after(async () => {});
  it("Send statement", async () => {
    let date_from = new Date();
    date_from.setMinutes(date_from.getMinutes() - 60);

    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "statement-service",
        method: "sendStatement",
        token: userToken
      },
      data: {
        date_from: date_from,
        date_to: new Date(),
        acc_no: "30000002",
        type: "incoming"
      }
    };
    try {
      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("Origin", "http://" + realmHost)
          .set("content-type", "application/json")
          .set("authorization", "bearer" + config.realmToken)
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "OK");
    } catch (e) {
      expect(e.actual).to.equal("ERROR");
    }
  });
});
