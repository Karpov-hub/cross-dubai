import db from "@lib/db";
import chai from "chai";
import chaiHttp from "chai-http";
import memstore from "@lib/memstore";
import pretest from "@lib/pretest";
import doc from "@lib/chai-documentator";

let should = chai.should();
chai.use(chaiHttp);
chai.use(require("chai-uuid"));

const expect = chai.expect;

import fileGateServer from "../src/index";

let file = {};

let ENV;

describe("File gate", async () => {
  before(async () => {
    ENV = await pretest.before();
  });

  after(async () => {});

  it("Download file", async () => {
    // let userData = {
    //   header: {
    //     id: 111,
    //     version: config.apiVersion,
    //     service: "auth-service",
    //     method: "signin"
    //   },
    //   data: {
    //     login: ENV.user2.dataValues.login,
    //     password: ENV.user2.dataValues.pass
    //   }
    // };
    // let realmToken = ENV.user2.dataValues.realm;
    // let user = await chai
    //   .request(gateserver)
    //   .post("/")
    //   .set("Origin", "http://")
    //   .set("content-type", "application/json")
    //   .set("authorization", "bearer" + realmToken)
    //   .send(userData);

    // console.log(user);
    let file = await db.provider.findOne({
      where: { mime_type: "image/png" }
    });
    let userToken;

    const res = await doc(
      chai
        .request(fileGateServer)
        .get(`/download/${file.dataValues.code}/${userToken}`)
    );

    res.res.should.have.deep.property("statusCode", 200);
    res.res.should.have.deep.property("statusMessage", "OK");
  });
});
