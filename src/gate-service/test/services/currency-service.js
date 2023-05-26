import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import doc from "@lib/chai-documentator";
import config from "@lib/config";

chai.use(require("chai-like"));
chai.use(require("chai-things"));

const realmToken =
  "YTRkZWdTOWFMWGFLSlQ1ZzpQSGJNQjg4ekpOT1BldHBkRk1wNzJKTEt4UmE4cDY=";

chai.use(chaiHttp);

describe("Currency service", async () => {
  before(async () => {});
  after(async () => {});

  it("Get exchange rates", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "currency-service",
        method: "getRates",
        token: ""
      },
      data: { service: "fiat_crypto" }
    };
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );
    res.body.header.should.have.deep.property("status", "OK");
    res.body.data.should.have.deep.property("currency");
  });
});
