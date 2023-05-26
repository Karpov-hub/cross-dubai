import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import db from "@lib/db";
import doc from "@lib/chai-documentator";
import config from "@lib/config";

chai.use(require("chai-uuid"));
chai.use(require("chai-like"));
chai.use(require("chai-things"));

chai.use(chaiHttp);

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
if (process.env.NODE_ENV == "localtest")
  describe("Falcon service methods", async () => {
    before(async () => {});
    after(async () => {});

    describe("Falcon service", async () => {
      it("Withdrawal fiat", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "falcon-service",
            method: "withdrawal",
            token: global.userToken
          },
          data: {
            amount: "100",
            currency: "EUR",
            destination_bank_account: "USD Bank Account"
          }
        };

        const res = await sendRequest(data);

        res.body.header.should.have.deep.property("status", "OK");
      });

      it("Withdrawal crypto", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "falcon-service",
            method: "withdrawal",
            token: global.userToken
          },
          data: {
            amount: "100",
            currency: "XRP",
            destination_address: {
              address_value: "rUQngTebGgF1tCexhuPaQBr5MufweybMom",
              address_suffix: "tag0",
              address_protocol: null
            }
          }
        };

        const res = await sendRequest(data);
        res.body.header.should.have.deep.property("status", "OK");
      });

      it("Get Balance", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "falcon-service",
            method: "getBalance",
            token: global.userToken
          },
          data: {}
        };

        const res = await sendRequest(data);
        res.body.header.should.have.deep.property("status", "OK");
      });

      it("Exchange", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "falcon-service",
            method: "exchange",
            token: global.userToken
          },
          data: {
            amount: "1",
            currency: "UST",
            to_currency: "EUR"
          }
        };

        const res = await sendRequest(data);
        res.body.header.should.have.deep.property("status", "OK");
      });
    });
  });
