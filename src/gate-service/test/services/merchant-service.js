import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import db from "@lib/db";
import doc from "@lib/chai-documentator";
import config from "@lib/config";
import { fdatasync } from "fs";

chai.use(require("chai-uuid"));
chai.use(require("chai-like"));
chai.use(require("chai-things"));

let file_data =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC";

chai.use(chaiHttp);

describe("Merchant service methods", async () => {
  before(async () => {
    await db.merchant.destroy({ truncate: true, cascade: true });
  });
  after(async () => {});

  let merchantId;

  describe("Merchant service", async () => {
    it("Create merchant", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "merchant-service",
          method: "createMerchant",
          token: global.userToken
        },
        data: {
          name: "merchant1",
          website: "www.website.com",
          description: "some text",
          categories: "1 category",
          account_fiat: "1000002",
          account_crypto: "20000000001"
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("Origin", "http://" + global.realmHost)
          .set("content-type", "application/json")
          .set("authorization", "bearer" + global.realmToken)
          .send(data)
      );

      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Get merchants", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "merchant-service",
          method: "getMerchants",
          token: global.userToken
        },
        data: {
          start: 0,
          limit: 1
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("Origin", "http://" + global.realmHost)
          .set("content-type", "application/json")
          .set("authorization", "bearer" + global.realmToken)
          .send(data)
      );
      merchantId = res.body.data.merchants[0].id;
      global.merchantId = merchantId;
      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Get merchant", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "merchant-service",
          method: "getMerchant",
          token: global.userToken
        },
        data: {
          merchant_id: merchantId
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("Origin", "http://" + global.realmHost)
          .set("content-type", "application/json")
          .set("authorization", "bearer" + global.realmToken)
          .send(data)
      );
      res.body.data.should.have.deep.property("id");
      res.body.data.should.have.deep.property("accounts");
      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Update merchant", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "merchant-service",
          method: "updateMerchant",
          token: global.userToken
        },
        data: {
          merchant_id: merchantId,
          acc1: global.account1,
          acc2: global.account2,
          name: "merchant_new",
          website: "www.website-new.com",
          description: "another text",
          callback: "callback",
          callback_error: "callback error"
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("Origin", "http://" + global.realmHost)
          .set("content-type", "application/json")
          .set("authorization", "bearer" + global.realmToken)
          .send(data)
      );

      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Add contract", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "merchant-service",
          method: "addContract",
          token: global.userToken
        },
        data: {
          id: "223f33c1-3416-4dcb-8ef4-0916d4d9e72d",
          director_name: "Name of director",
          contract_subject: "Subject of Contract",
          files: [
            {
              name: "contract.png",
              data: file_data
            }
          ],
          description: "Description of Contract",
          contract_date: new Date(),
          expiration_date: new Date(),
          merchant: "3f4d56c7-f25e-4103-b71f-4617cdc2050c",
          realm: "7457349e-c49f-437e-a689-198dca2889aa"
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("Origin", "http://" + global.realmHost)
          .set("content-type", "application/json")
          .set("authorization", "bearer" + global.realmToken)
          .send(data)
      );

      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
    });

    it("Upload File to the Contract", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "merchant-service",
          method: "uploadFile",
          token: global.userToken
        },
        data: {
          id: "9f13d0d7-a896-4b93-8303-97adab9c748c",
          files: [
            {
              name: "contract.png",
              data: file_data
            }
          ],
          owner_id: "223f33c1-3416-4dcb-8ef4-0916d4d9e72d"
        }
      };

      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("Origin", "http://" + global.realmHost)
          .set("content-type", "application/json")
          .set("authorization", "bearer" + global.realmToken)
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
    });
  });
});
