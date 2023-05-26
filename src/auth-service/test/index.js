import chai from "chai";
import db from "@lib/db";
import pretest from "@lib/pretest";
import sha1 from "sha1";
import uuid from "chai-uuid";
chai.use(uuid);
import MemStore from "@lib/memstore";
import Queue from "@lib/queue";
import pdfGenerator from "@lib/pdf-generator";
import excelGenerator from "@lib/excel-generator";
const should = chai.should();
const expect = chai.expect;

import Service from "../src/Service.js";
const service = new Service({
  name: "auth-service"
});

const sessionId = "sssssssssssssssssssssssssssssssssss";
let file = {};
file.data =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC";
let ENV;
let userId;
let activateCode;
let corpUserId;
let signin_userId;
let signin_token;
let restoreCode;
let otp_token;

const getCaptchaText = async () => {
  await service.runServiceMethod({
    method: "getCaptcha",
    data: {
      token: sessionId
    },
    realmId: ENV.realmId
  });
  return await MemStore.get("cpt" + sessionId);
};

describe("Auth service", async () => {
  before(async () => {
    await db.user.destroy({
      truncate: {
        cascade: false
      }
    });
    ENV = await pretest.before();

    await MemStore.del("blk" + sha1("test-corp@test.ru-" + ENV.realmId));

    await db.trigger.destroy({
      where: {
        service: "auth-service",
        method: "signup"
      }
    });
    await MemStore.del("auth-service:signup");
    await db.trigger.create({
      id: ENV.realmId,
      service: "auth-service",
      method: "signup",
      ctime: new Date(),
      mtime: new Date()
    });
  });
  after(async () => {
    await MemStore.del("blk" + sha1("test-corp@test.ru-" + ENV.realmId));
  });

  it("Check Excel generator", async () => {
    let data = {
      name: "Document.xlsx",
      title: "Document-title",
      description: "Document-description",
      lists: [
        {
          title: "List 1",
          columns: [
            { header: "column1", key: "col1", width: 123 },
            { header: "column2", key: "col2", width: 123 }
          ],
          data: [
            { col1: "blah-blah-blah", col2: 222 },
            { col1: "blah-blah-blah", col2: 222 }
          ]
        }
      ]
    };

    let res = await excelGenerator.generate(data);
    res.should.have.deep.property("success", true);
    res.should.have.deep.property("code");
  });

  it("Check PDF generator", async () => {
    let pug = `
doctype html
head
each item in data
            h1= item.name
            h1= item.lname
`;
    let data = [
      {
        name: "name",
        lname: "lname"
      },
      {
        name: "name1",
        lname: "lname1"
      }
    ];
    let res = await pdfGenerator.generate(data, pug);
    res.should.have.deep.property("success", true);
    res.should.have.deep.property("code");
  }).timeout(5000);

  it("Check trigger on signup", async () => {
    await service.getTriggersFromService();
    expect(service.triggers)
      .to.be.an("array")
      .that.includes("signup");
  });

  describe("Signup personal", () => {
    let data = {
      type: 0,
      email: "test@test.ru",
      first_name: "first_name",
      last_name: "last_name",
      middle_name: "middle_name",
      country: "RU",
      city: "city",
      street: "street",
      house: "house",
      apartment: "apartment",
      last_name: "last_name",
      birthday: "01.01.1990",
      password: "Passw0rd!#",
      google_auth: false
    };

    it("Get captcha", async () => {
      const res = await service.runServiceMethod({
        method: "getCaptcha",
        data: {
          token: sessionId
        },
        realmId: ENV.realmId
      });
      res.should.have.deep.property("data");
    });

    it("Create new user, wrong captcha", async () => {
      let ee;
      try {
        await service.runServiceMethod({
          method: "signup",
          data,
          realmId: ENV.realmId
        });
      } catch (e) {
        ee = e;
      }
      expect(ee).to.equal("CAPTCHAEXPECTED");
    });

    it("Invalid email", async () => {
      data.token = sessionId;
      data.captcha = await getCaptchaText();

      data.email = "abc";
      try {
        const res = await service.runServiceMethod({
          method: "signup",
          data,
          realmId: ENV.realmId
        });
        expect(res).to.be.a("null");
      } catch (e) {
        expect(e).to.equal("INVALIDEMAIL");
      }
    });
    it("Email cannot be empty", async () => {
      data.email = "";
      try {
        const res = await service.runServiceMethod({
          method: "signup",
          data,
          realmId: ENV.realmId
        });
        expect(res).to.be.a("null");
      } catch (e) {
        expect(e).to.equal("INVALIDEMAIL");
      }
    });
    // it("Invalid password", async () => {
    //   data.email = "abc@abc.ru";
    //   data.password = "111111111";
    //   try {
    //     const res = await service.runServiceMethod({
    //       method: "signup",
    //       data,
    //       realmId: ENV.realmId
    //     });
    //     expect(res).to.be.a("null");
    //   } catch (e) {
    //     expect(e).to.equal("INVALIDPASSWORD");
    //   }
    // });
    it("Create new user", async () => {
      data.email = "test@test.ru";
      const res = await service.runServiceMethod({
        method: "signup",
        realmId: ENV.realmId,
        data
      });

      const user = await db.user.findOne({
        where: {
          id: res.id
        }
      });

      expect(user.id).to.be.a.uuid("v1");
      // expect(user.pass).to.equal(sha1(data.password));
      expect(user.realm).to.equal(ENV.realmId);
      userId = res.id;
      // activateCode = res.activateCode;
      await db.user.update(
        {
          temp_pass: "50c3523e8730624aa305cd937bfae919ba5aa08b"
        },
        { where: { id: res.id } }
      );
    });
    //   it("Activate personal user", async () => {
    //     await service.runServiceMethod({
    //       method: "activate",
    //       data: {
    //         user_id: userId,
    //         code: activateCode
    //       },
    //       realmId: ENV.realmId
    //     });
    //     let usr = await db.user.findOne({
    //       where: { id: userId }
    //     });
    //     usr.dataValues.should.have.deep.property("activated", true);

    //     await db.user.update({ activated: false }, { where: { id: userId } });
    //   });
    //   it("Activate already activated personal user", async () => {
    //     try {
    //       await service.runServiceMethod({
    //         method: "activate",
    //         data: {
    //           user_id: userId,
    //           code: activateCode
    //         },
    //         realmId: ENV.realmId
    //       });
    //     } catch (e) {
    //       expect(e).to.equal("ALREADYACTIVATED");
    //     }
    //   });
    // });
    describe("Signup corporate", () => {
      let data = {
        type: 1,
        email: "test-corp@test.ru",
        first_name: "first_name",
        last_name: "last_name",
        birthday: "01.01.1990",
        countries: "1,2,3",
        legalname: "orgname",
        password: "Passw0rd!#",
        google_auth: false
      };

      it("Legal name cannot be empty", async () => {
        data.token = sessionId;
        data.captcha = await getCaptchaText();
        data.legalname = "";
        try {
          const res = await service.runServiceMethod({
            method: "signup",
            data,
            realmId: ENV.realmId
          });
          expect(res).to.be.a("null");
        } catch (e) {
          expect(e).to.equal("LEGALNAMEISEMPTY");
        }
      });
      it("Create new corporate user", async () => {
        data.legalname = "orgname";
        const res = await service.runServiceMethod({
          method: "signup",
          data,
          realmId: ENV.realmId
        });

        const user = await db.user.findOne({
          where: {
            id: res.id
          }
        });
        expect(user.id).to.be.a.uuid(res.id);
        // expect(user.pass).to.equal(sha1(data.password));
        corpUserId = user.id;
        // activateCode = res.activateCode;
        await db.user.update(
          {
            temp_pass: "50c3523e8730624aa305cd937bfae919ba5aa08b"
          },
          { where: { id: user.id } }
        );
      });
      // it("Activate corporate user", async () => {
      //   await service.runServiceMethod({
      //     method: "activate",
      //     data: {
      //       user_id: corpUserId,
      //       code: activateCode
      //     },
      //     realmId: ENV.realmId
      //   });
      //   let usr = await db.user.findOne({
      //     where: { id: corpUserId }
      //   });
      //   usr.dataValues.should.have.deep.property("activated", true);
    });
  });
  describe("Signin user", () => {
    it("Valid login (first time)", async () => {
      await db.user.update(
        { otp_transport: "test" },
        { where: { login: "test@test.ru" } }
      );
      const res = await service.runServiceMethod({
        method: "signin",
        data: {
          login: "test@test.ru",
          password: "Passw0rd!#"
        },
        realmId: ENV.realmId
      });

      expect(res)
        .to.have.property("otp_token")
        .that.is.a("string");
      expect(res).to.have.deep.property("channel", "test");
      expect(res)
        .to.have.property("available_channels")
        .that.is.an("array")
        .and.have.lengthOf(2);
      otp_token = res.otp_token;
    });

    it("Check authorization otp (first time)", async () => {
      const res = await service.runServiceMethod({
        method: "checkAuthOtp",
        data: {
          otp: "111111",
          otp_token
        },
        realmId: ENV.realmId
      });
      expect(res)
        .to.have.property("otp_token")
        .that.is.a("string");
      expect(res).to.have.deep.property("temp_pass", true);
    });

    it("Set permanent password and get authorization token (first time)", async () => {
      const res = await service.runServiceMethod({
        method: "setPermanentPassword",
        data: {
          otp_token,
          password: "Passw0rd!#"
        },
        realmId: ENV.realmId
      });
      expect(res)
        .to.have.property("user_token")
        .that.is.a("string");

      signin_userId = await MemStore.get("usr" + res.user_token);
      signin_token = res.user_token;

      res.should.have.deep.property("success", true);
    });

    it("Sending temporary password to user", async () => {
      const userBeforeSending = await db.user.findOne({
        where: { id: signin_userId }
      });
      const res = await service.runServiceMethod({
        method: "sendTempPassToUser",
        data: {
          id: userBeforeSending.id,
          email: userBeforeSending.email
        },
        realmId: ENV.realmId,
        userId: signin_userId
      });
      const userAfterSending = await db.user.findOne({
        where: { id: signin_userId }
      });
      expect(userBeforeSending.temp_pass).not.equal(userAfterSending.temp_pass);
    });
    it("Signin user with permanent password", async () => {
      await db.user.update(
        { otp_transport: "test" },
        { where: { login: "test@test.ru" } }
      );

      const res = await service.runServiceMethod({
        method: "signin",
        data: {
          login: "test@test.ru",
          password: "Passw0rd!#"
        },
        realmId: ENV.realmId
      });
      expect(res)
        .to.have.property("otp_token")
        .that.is.a("string");
      expect(res).to.have.deep.property("channel", "test");
      expect(res)
        .to.have.property("available_channels")
        .that.is.an("array")
        .and.have.lengthOf(2);
      otp_token = res.otp_token;

      const otp_result = await service.runServiceMethod({
        method: "checkAuthOtp",
        data: {
          otp: "111111",
          otp_token
        },
        realmId: ENV.realmId
      });

      expect(otp_result)
        .to.have.property("user_token")
        .that.is.a("string");
      signin_userId = await MemStore.get("usr" + otp_result.user_token);
      signin_token = otp_result.user_token;
    });

    it("Sign out user", async () => {
      let o = { token: signin_token };
      let storedUserTokenFull = await MemStore.get("usr" + signin_token);
      expect(storedUserTokenFull).to.be.a("string");
      let signOutRes = await service.runServiceMethod({
        method: "signout",
        data: o,
        realmId: ENV.realmId,
        userId
      });
      signOutRes.should.have.deep.property("success", true);
      let storedUserTokenEmpty = await MemStore.get("usr" + signin_token);
      expect(storedUserTokenEmpty).to.be.null;
      const res = await service.runServiceMethod({
        method: "signin",
        data: {
          login: "test@test.ru",
          password: "Passw0rd!#"
        },
        realmId: ENV.realmId
      });
      expect(res)
        .to.have.property("otp_token")
        .that.is.a("string");
      expect(res).to.have.deep.property("channel", "test");
      expect(res)
        .to.have.property("available_channels")
        .that.is.an("array")
        .and.have.lengthOf(2);
      otp_token = res.otp_token;

      const otp_result = await service.runServiceMethod({
        method: "checkAuthOtp",
        data: {
          otp: "111111",
          otp_token
        },
        realmId: ENV.realmId
      });

      expect(otp_result)
        .to.have.property("user_token")
        .that.is.a("string");
    });

    it("Valid login invalid realm", async () => {
      let ee;
      try {
        await service.runServiceMethod({
          method: "signin",
          data: {
            login: "test@test.ru",
            password: "Passw0rd!#"
          },
          realmId: "daa5ec05-d2e6-4032-9b28-37f635910714"
        });
      } catch (e) {
        ee = e;
      }
      expect(ee).to.equal("LOGINERROR");
    });

    it("Send restore password code", async () => {
      const res = await service.runServiceMethod({
        method: "sendRestorePasswordCode",
        data: {
          email: "test-corp@test.ru"
        },
        realmId: ENV.realmId
      });

      res.should.have.deep.property("success", true);
      res.should.have.deep.property("code");

      restoreCode = res.code;
    });

    it("Restore password", async () => {
      const res = await service.runServiceMethod({
        method: "restorePassword",
        data: {
          code: restoreCode,
          new_password: "Passw0rd!@"
        },
        realmId: ENV.realmId
      });

      res.should.have.deep.property("success", true);
    });

    it("Block signin on wrong password attempеs", async () => {
      let ee;
      let data = {
        login: "test@test.ru",
        password: "error"
      };
      try {
        await service.runServiceMethod({
          method: "signin",
          data,
          realmId: ENV.realmId
        });
      } catch (e) {
        ee = e;
      }
      expect(ee).to.equal("LOGINERROR");
      try {
        await service.runServiceMethod({
          method: "signin",
          data,
          realmId: ENV.realmId
        });
      } catch (e) {
        ee = e;
      }
      expect(ee).to.equal("LOGINERROR");
      try {
        await service.runServiceMethod({
          method: "signin",
          data,
          realmId: ENV.realmId
        });
      } catch (e) {
        ee = e;
      }
      expect(ee).to.equal("LOGINERROR");

      try {
        await service.runServiceMethod({
          method: "signin",
          data,
          realmId: ENV.realmId
        });
      } catch (e) {
        ee = e;
      }
      expect(ee).to.equal("LOGINBLOCKED");
    });
  });

  describe("Accept cookie, change user password, secret question and phone", () => {
    let data = {};
    it("Accept cookie", async () => {
      let res = await service.runServiceMethod({
        method: "acceptCookie",
        data,
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Change password: Passwords do not match", async () => {
      data.password = "Passw0rd#!";
      data.new_password = "Passw0rd#!";
      let ee;
      try {
        await service.runServiceMethod({
          method: "changePassword",
          data,
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        ee = e;
      }
      expect(ee).to.equal("PASSWORDSDONOTMATCH");
    });

    it("Successful user password change", async () => {
      data.password = "Passw0rd!#";
      data.new_password = "Passw0rd#!";
      const res = await service.runServiceMethod({
        method: "changePassword",
        data,
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Successful user secret question change", async () => {
      let data = {
        secret_question: "Question",
        secret_answer: "Answer"
      };
      let res = await service.runServiceMethod({
        method: "changeSecretQuestion",
        data,
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Change phone", async () => {
      const res = await service.runServiceMethod({
        method: "changePhone",
        data: {
          new_phone: "202-555-0140"
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Change OTP channel (not available channel)", async () => {
      let ee;
      try {
        await service.runServiceMethod({
          method: "changeOtpChannel",
          data: {
            channel: "emaail"
          },
          realmId: ENV.realmId,
          userId
        });
      } catch (e) {
        ee = e;
      }
      expect(ee).to.equal("NOT_AVAILABLE_CHANNEL");
    });

    it("Change OTP channel (success)", async () => {
      const res = await service.runServiceMethod({
        method: "changeOtpChannel",
        data: {
          channel: "email"
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Change OTP channel (test)", async () => {
      const res = await service.runServiceMethod({
        method: "changeOtpChannel",
        data: {
          channel: "test"
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });
  });

  describe("2FA Google", () => {
    let data = {
      login: "test-corp@test.ru",
      user_token: "2ER6T5"
    };
    it("Returned secret key and QR data url", async () => {
      const res = await service.runServiceMethod({
        method: "googleAuthGenerateQR",
        data,
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("secret_key").to.not.be.a("undefined");
      res.should.have.deep.property("qr_code").to.not.be.a("undefined");
    });
    it("User Verification Method", async () => {
      try {
        const res = await service.runServiceMethod({
          method: "googleAuthVerify",
          data,
          realmId: ENV.realmId,
          userId
        });
        res.should.have.deep.property("verified").to.not.be.a("undefined");
      } catch (e) {
        expect(e).to.equal("NOTVERIFIED");
      }
    });
  });

  describe("Set and get avatar, update profile", () => {
    it("Get avatar: avatar not set", async () => {
      const res = await service.runServiceMethod({
        method: "getAvatar",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("avatar", null);
    });
    it("Update profile", async () => {
      const res = await service.runServiceMethod({
        method: "updateProfile",
        data: {
          first_name: "firstname",
          last_name: "lastname"
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });
    it("Change to corporate", async () => {
      const res = await service.runServiceMethod({
        method: "changeToCorporate",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });
    it("Get referals", async () => {
      const res = await service.runServiceMethod({
        method: "getReferals",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      //res.should.have.deep.property("success", true);
    });
    /*it("Upload avatar", async () => {
      const res = await service.runServiceMethod({
        method: "avatarUpload",
        data: {
          file: file.data
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });
    it("Get avatar", async () => {
      const res = await service.runServiceMethod({
        method: "getAvatar",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("avatar");
    });*/
  });

  describe("Add and delete IP", () => {
    it("Add IP", async () => {
      const res = await service.runServiceMethod({
        method: "saveIP",
        data: {
          ip: ["127.0.0.1", "192.168.0.126"]
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });
    it("Delete IP", async () => {
      const res = await service.runServiceMethod({
        method: "saveIP",
        data: {
          ip: ["127.0.0.1"]
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });
  });

  describe("Upload, update and get documents, framework agreement", () => {
    it("Upload document", async () => {
      const res = await service.runServiceMethod({
        method: "uploadDocument",
        data: {
          files: file.data,
          type: "29a74bb9-bbf4-4e96-8360-602f2aa5fb33",
          status: 1
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });
    it("Update document", async () => {
      const doc = await db.user_documents.findOne({
        where: {
          user_id: userId,
          type: "29a74bb9-bbf4-4e96-8360-602f2aa5fb33",
          status: 1
        }
      });
      const res = await service.runServiceMethod({
        method: "updateDocument",
        data: {
          id: doc.id,
          files: file.data,
          type: "29a74bb9-bbf4-4e96-8360-602f2aa5fb33",
          status: 1
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });
    it("Get all user documents", async () => {
      const res = await service.runServiceMethod({
        method: "getUserDocuments",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("userDocList").to.not.be.a("undefined");
    });
    it("Did user signed framed agreement", async () => {
      const res = await service.runServiceMethod({
        method: "didUserSignedFramedAgreement",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("flag").to.not.be.a("undefined");
    });
  });

  describe("Send notification to the user", () => {
    it("Send notification by email, telegram", async () => {
      let { id: transporter_id } = await db.transporter.findOne({
        attributes: ["id"],
        raw: true
      });
      let letter_obj = {
        realm: ENV.realmId,
        code: "test-notification",
        letter_name: "test",
        lang: "en",
        transporter: transporter_id
      };
      await db.letter.create(letter_obj);
      letter_obj.lang = "ru";
      await db.letter.create(letter_obj);
      await db.user.update(
        { communication_lang: "ru" },
        { where: { email: "testuser@user.com" } }
      );
      const res = await service.runServiceMethod({
        method: "sendNotificationToTheUser",
        data: {
          code: "test-notification",
          recipient: "testuser@user.com",
          body: { test: true }
        },
        realmId: ENV.realmId
      });
      res.should.have.deep.property("success", true);
    });
  });

  describe("System notifications", () => {
    const getSystemNotifications = async (user_id) => {
      return await db.user_system_notification.findAll({
        where: { user_id },
        attributes: ["id", "new_record"],
        raw: true
      });
    };
    it("Get list of user's system notifications", async () => {
      await db.user_system_notification.create({
        user_id: userId,
        message: { ru: "тест", en: "test" },
        ctime: new Date()
      });
      const res = await service.runServiceMethod({
        method: "getSystemNotificationsList",
        data: {
          start: 0,
          limit: 100
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("count", 1);
    });
    it("Mark as readed list of user's system notifications", async () => {
      let original_notif_list = await getSystemNotifications(userId);
      const res = await service.runServiceMethod({
        method: "markAsReadedSystemNotificationsList",
        data: {
          list: original_notif_list.map((el) => el.id)
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
      let updatged_notif_list = await getSystemNotifications(userId);
      expect(updatged_notif_list.length).to.be.equal(
        original_notif_list.length
      );
      for (let original of original_notif_list) {
        let updated = updatged_notif_list.find((el) => {
          return el.id == original.id;
        });
        expect(updated.new_record).should.be.not.equal(original.new_record);
      }
    });
    it("Delete sustem notification", async () => {
      let original_notif_list = await getSystemNotifications(userId);
      const res = await service.runServiceMethod({
        method: "removeSystemNotification",
        data: {
          notification_id: original_notif_list[0].id
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
      let updatged_notif_list = await getSystemNotifications(userId);
      expect(updatged_notif_list.length).to.be.equal(
        original_notif_list.length - 1
      );
    });
    it("Get telegram channels (no data found)", async () => {
      const res = await service.runServiceMethod({
        method: "getTelegramChannels",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("code", "TG_APP_NOT_FOUND");
    });
    let tg_app;
    it("Get telegram channels (have app, no channels)", async () => {
      tg_app = await db.telegram_app.create({
        user_id: userId,
        ctime: new Date()
      });
      tg_app = tg_app.get("id");
      const res = await service.runServiceMethod({
        method: "getTelegramChannels",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      expect(res)
        .to.have.property("user_data")
        .that.is.a("object");
      expect(res)
        .to.have.property("wallets_data")
        .that.is.an("array");
    });
    it("Get telegram channels (have app, and channels)", async () => {
      const buildInsObj = (ref_id) => {
        return {
          channel_id: "1",
          ref_id: ref_id,
          join_link: "join_here_link" + new Date().getTime(),
          telegram_app: tg_app
        };
      };
      let ca_ids = [
        "0106453e-c9a2-4e18-a037-16fc52cef241",
        "2ff8b80e-2d86-4878-923f-b96e8cb7329b",
        "3a2da6c2-16f9-458f-a348-6c2eb82f6573"
      ];
      await db.account_crypto.destroy({
        where: { id: [ca_ids[0], ca_ids[1], ca_ids[2]] }
      });
      await db.telegram_channel.destroy({ truncate: true });
      await db.account_crypto.bulkCreate([
        {
          id: ca_ids[0],
          acc_no: "02",
          address: "0xxxx",
          wallet_type: 0
        },
        {
          id: ca_ids[1],
          acc_no: "01",
          address: "0xxxx",
          wallet_type: 0
        },
        {
          id: ca_ids[2],
          acc_no: "03",
          address: "1xxxx",
          wallet_type: 0
        }
      ]);
      await db.account.bulkCreate([
        { acc_no: "01", owner: userId, status: 1 },
        { acc_no: "02", owner: userId, status: 1 },
        { acc_no: "03", owner: userId, status: 1 }
      ]);

      await db.telegram_channel.bulkCreate([
        buildInsObj(userId),
        buildInsObj(ca_ids[0]),
        buildInsObj(ca_ids[1]),
        buildInsObj(ca_ids[2])
      ]);

      const res = await service.runServiceMethod({
        method: "getTelegramChannels",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      expect(res)
        .to.have.property("user_data")
        .that.is.a("object");
      expect(res.user_data).to.have.property("join_link");
      expect(res)
        .to.have.property("wallets_data")
        .that.is.an("array")
        .and.have.lengthOf(2);
    });
  });
});
