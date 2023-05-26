import chai from "chai";
let should = chai.should();
import db from "@lib/db";
const expect = chai.expect;

import Service from "../src/Service.js";
const service = new Service({
  name: "kyc-service"
});
let file = {};
file.data =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC";
let realmId = "df34ada1-ffe2-4a2f-aad6-f1301c95b050";
let userId;
let KYCId = {};
let verification_code;

describe("KYC service", async () => {
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
    const res = await db.user.create({
      type: 0,
      email: "test@test.ru",
      first_name: "first_name",
      last_name: "last_name",
      birthday: "01.01.1990",
      countries: "1,2,3",
      legalname: "",
      password: "Passw0rd!#",
      google_auth: false,
      password: "Passw0rd!#",
      realm: realmId
    });
    userId = res.dataValues.id;
  });

  after(async () => {
    await db.provider.truncate();
    await db.user.destroy({
      truncate: {
        cascade: false
      }
    });
    await db.profile_kyc.truncate();
    await db.address_kyc.truncate();
    await db.company_kyc.truncate();
  });

  it("Push file", async () => {
    const res = await service.runServiceMethod({
      method: "pushFile",
      data: {
        name: "electricity_bill.txt",
        data: file.data
      }
    });
    res.should.have.deep.property("code").to.not.be.a("undefined");
    res.should.have.deep.property("success", true);

    file.code = res.code;
    file.name = "electricity_bill.txt";
    file.size = res.size;
    file.sendData = file.data;
  });
  it("Pull file", async () => {
    const res = await service.runServiceMethod({
      method: "pullFile",
      data: {
        code: file.code
      }
    });
    res.should.have.deep.property("name").to.not.be.a("undefined");
    res.should.have.deep.property("size").to.not.be.a("undefined");
    res.should.have.deep.property("data").to.not.be.a("undefined");
    res.should.have.deep.property("name").to.equal(file.name);
    res.should.have.deep.property("size").to.equal(file.size);
    res.should.have.deep.property("data").to.equal(file.sendData);
  });
  it("Watermark file", async () => {
    const res = await service.runServiceMethod({
      method: "watermarkFile",
      data: {
        code: file.code
      }
    });
    res.should.have.deep.property("success", true);
  }).timeout(5000);
  it("Accept file", async () => {
    const res = await service.runServiceMethod({
      method: "acceptFile",
      data: [
        {
          name: "bill.txt",
          data: "f4d275f0-ddea-11e9-a7f9-f3ac227b0e18"
        },
        {
          name: "electricity_bill.txt",
          data: file.code
        }
      ]
    });
    res.should.have.deep.property("success", true);
  });
  it("Status file", async () => {
    const res = await service.runServiceMethod({
      method: "statusFile",
      data: {
        code: file.code
      }
    });
    res.should.have.deep.property("name").to.not.be.a("undefined");
    res.should.have.deep.property("size").to.not.be.a("undefined");
    res.should.have.deep.property("name").to.equal(file.name);
    res.should.have.deep.property("size").to.equal(file.size);
  });
  it("Delete file", async () => {
    const res = await service.runServiceMethod({
      method: "delFile",
      data: {
        code: file.code
      }
    });
    res.should.have.deep.property("code").to.not.be.a("undefined");
    res.should.have.deep.property("code").to.equal(file.code);
    res.should.have.deep.property("success", true);
  }).timeout(5000);

  describe("Legal confirmation", async () => {
    it("Legal confirmation", async () => {
      const res = await service.runServiceMethod({
        method: "legalConfirmation",
        data: {},
        realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });
  });

  describe("Verify phone methods", async () => {
    it("Generate verification code", async () => {
      const res = await service.runServiceMethod({
        method: "generateVerificationCode",
        data: {},
        realmId,
        userId
      });
      verification_code = res.code;
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("code").not.to.be.a("null");
    });
    it("Verify phone", async () => {
      const res = await service.runServiceMethod({
        method: "verifyPhone",
        data: {
          code: verification_code
        },
        realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });
  });
});
