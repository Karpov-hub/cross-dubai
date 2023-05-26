import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import db from "@lib/db";
import doc from "@lib/chai-documentator";
import config from "@lib/config";

chai.use(require("chai-like"));
chai.use(require("chai-things"));

let file = {};

const realmToken =
  "YTRkZWdTOWFMWGFLSlQ1ZzpQSGJNQjg4ekpOT1BldHBkRk1wNzJKTEt4UmE4cDY=";

chai.use(chaiHttp);

describe("File provider", async () => {
  before(async () => {
    await db.provider.truncate();
    await db.provider.create({
      id: "df34ada1-ffe2-4a2f-aad6-f1301c95b050",
      code: "f4d275f0-ddea-11e9-a7f9-f3ac227b0e18",
      filename: "bill.txt",
      file_size: 10,
      mime_type: "text/plain",
      upload_date: new Date(),
      storage_date: new Date().setSeconds(new Date().getSeconds() + 300),
      ctime: new Date(),
      mtime: new Date(),
      removed: 0
    });
  });
  after(async () => {
    await db.provider.truncate();
  });

  it("Push file", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "kyc-service",
        method: "pushFile",
        token: ""
      },
      data: {
        name: "electricity_bill.txt",
        data:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC"
      }
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
    res.body.data.should.have.deep.property("success", true);
    res.body.data.should.have.deep.property("code").to.not.be.a("undefined");
    file.code = res.body.data.code;
    file.name = data.data.name;
    file.size = res.body.data.size;
    file.sendData = data.data.data;
  });
  it("Pull file", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "kyc-service",
        method: "pullFile",
        token: ""
      },
      data: {
        code: file.code
      }
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
    res.body.data.should.have.deep.property("data");
    //res.body.data.should.have.deep.property("name").to.not.be.a("undefined");
    //res.body.data.should.have.deep.property("size").to.not.be.a("undefined");
    //res.body.data.should.have.deep.property("data").to.not.be.a("undefined");
    //res.body.data.should.have.deep.property("name").to.equal(file.name);
    //res.body.data.should.have.deep.property("size").to.equal(file.size);
  });

  it("Watermark file", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "kyc-service",
        method: "watermarkFile",
        token: ""
      },
      data: {
        code: file.code
      }
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
    res.body.data.should.have.deep.property("success", true);
    res.body.data.should.have.deep.property("code").to.not.be.a("undefined");
    res.body.data.should.have.deep.property("code").to.equal(file.code);
  }).timeout(5000);

  it("Status file", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "kyc-service",
        method: "statusFile",
        token: ""
      },
      data: {
        code: file.code
      }
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
    res.body.data.should.have.deep.property("name").to.not.be.a("undefined");
    res.body.data.should.have.deep.property("size").to.not.be.a("undefined");
    res.body.data.should.have.deep.property("name").to.equal(file.name);
    res.body.data.should.have.deep.property("size").to.equal(file.size);
  });
  it("Delete file", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "kyc-service",
        method: "delFile",
        token: ""
      },
      data: {
        code: file.code
      }
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
    res.body.data.should.have.deep.property("success", true);
    res.body.data.should.have.deep.property("code").to.not.be.a("undefined");
    res.body.data.should.have.deep.property("code").to.equal(file.code);
  }).timeout(5000);
});
