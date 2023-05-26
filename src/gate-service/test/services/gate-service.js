//process.env.NODE_ENV = "test";

import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
//import redis_mock from "ioredis";
import memStor from "@lib/memstore";
import doc from "@lib/chai-documentator";
import config from "@lib/config";

let should = chai.should();

let authToken, userToken;

const HOST_NAME = "test.host";

authToken = "123";

chai.use(chaiHttp);

describe("Gate Service", async () => {
  let PingData = {
    header: {
      id: 111,
      version: config.apiVersion,
      service: "auth-service",
      method: "signup"
    },
    data: null
  };

  it("Ping, wrong version", async () => {
    PingData.header.version = "1";
    const res = await doc(
      chai
        .request(server)
        .post("/")
        .set("host", HOST_NAME)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + authToken)
        .send(PingData)
    );
    res.body.header.status.should.equal("ERROR");
    res.body.error.code.should.equal("VERSION");
  });

  it("Ping skeleton microservice, valid data schema", async () => {
    let PingData = {
      header: {
        id: 111,
        lang: "ru",
        version: config.apiVersion,
        service: "skeleton",
        method: "ping",
        nonce: "123"
      },
      data: {
        text: "test text",
        num: 1234
      }
    };
    const res = await chai
      .request(server)
      .post("/")
      .set("host", HOST_NAME)
      .set("content-type", "application/json")
      .set("authorization", "bearer" + authToken)
      .send(PingData);

    res.body.header.should.have.deep.property("status", "OK");
    res.body.data.should.have.deep.property("test-pong", true);
    res.body.data.should.have.deep.property("language", "ru");
  });

  it("Ping skeleton microservice, invalid data schema", async () => {
    let PingData = {
      header: {
        id: 111,
        lang: "ru",
        version: config.apiVersion,
        service: "skeleton",
        method: "ping",
        nonce: "124"
      },
      data: {
        text: "test text",
        num: "1234" // should be number
      }
    };
    const res = await chai
      .request(server)
      .post("/")
      .set("host", HOST_NAME)
      .set("content-type", "application/json")
      .set("authorization", "bearer" + authToken)
      .send(PingData);

    res.body.header.status.should.equal("ERROR");
    res.body.error.should.have.deep.property("code", "INVALIDSCHEMA");
    res.body.error.should.have.deep.property("object");
  });

  it("Check REST API request", async () => {
    const res = await chai
      .request(server)
      .post(`/rest/skeleton/ping?lang=ru&id=111&version=${config.apiVersion}`)
      .set("host", HOST_NAME)
      .set("content-type", "application/json")
      .set("authorization", "bearer" + authToken)
      .send({
        text: "test text",
        num: 1234
      });

    res.body.header.should.have.deep.property("status", "OK");
    res.body.data.should.have.deep.property("test-pong", true);
    res.body.data.should.have.deep.property("language", "ru");
  });

  it("Test nonce", async () => {
    let PingData = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "skeleton",
        method: "ping",
        nonce: "123"
      },
      data: null
    };
    const res = await chai
      .request(server)
      .post("/")
      .set("host", HOST_NAME)
      .set("content-type", "application/json")
      .set("authorization", "bearer" + authToken)
      .send(PingData);

    res.body.header.status.should.equal("ERROR");
    res.body.error.code.should.equal("ERRORNONCE");
  });
});
