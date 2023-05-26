import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import db from "@lib/db";
import pretest from "@lib/pretest";
import memstore from "@lib/memstore";
import Queue from "@lib/queue";
import doc from "@lib/chai-documentator";
import uuid from "uuid/v4";
import config from "@lib/config";

chai.use(require("chai-uuid"));
chai.use(require("chai-like"));
chai.use(require("chai-things"));

const expect = chai.expect;

let should = chai.should();
let userToken;
let KYCId = {};
let file_data =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC";
let verification_code;
let otp_token;
let restoreCode;

global.ENV = null;
global.userToken = null;
global.realmToken = uuid();
global.childRealmToken = uuid();
global.sessionId = uuid();
global.realmId = null;
global.realmHost = "test.realm";

global.refUserSender = null;
global.refUserDepended = null;

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

describe("Auth service methods", async () => {
  before(async () => {
    await db.user.destroy({
      truncate: {
        cascade: false
      }
    });
    ENV = await pretest.before();
    realmId = ENV.realmId;
    Queue.broadcastJob("getTriggersFromService", {});
    await db.realm.update(
      {
        token: childRealmToken,
        pid: realmId,
        domain: realmHost,
        permissions: {
          "auth-service": {
            signin: true,
            signinSecondStage: true,
            setPassword: true,
            checkOtp: true,
            checkAuthOtp: true
          }
        }
      },
      {
        where: {
          id: ENV.childRealmId
        }
      }
    );

    await db.realm.update(
      {
        token: realmToken,
        domain: realmHost,
        permissions: {
          "auth-service": {
            signup: true,
            signin: true,
            signinSecondStage: true,
            setPassword: true,
            getCaptcha: true,
            checkOtp: true,
            resendOtp: true,
            googleAuthVerify: true,
            googleAuthGenerateQR: true,
            getProfile: true,
            enableDisableGoogleAuth: true,
            changePassword: true,
            changeSecretQuestion: true,
            sendRestorePasswordCode: true,
            restorePassword: true,
            getAvatar: true,
            avatarUpload: true,
            saveIP: true,
            updateProfile: true,
            changeToCorporate: true,
            getReferals: true,
            activate: true,
            acceptCookie: true,
            uploadDocument: true,
            updateDocument: true,
            getUserDocuments: true,
            didUserSignedFramedAgreement: true,
            changePhone: true,
            confirmPassword: true,
            sendNewEmailVerifyLink: true,
            changeEmail: true,
            getWhiteListCountries: true,
            checkVAT: true,
            signout: true,
            getSystemNotifications: true,
            setPermanentPassword: true,
            checkAuthOtp: true,
            resendAuthOtp: true,
            changeOtpChannel: true
          },
          "account-service": {
            getAllBalance: true,
            create: true,
            remove: true,
            block: true,
            withdrawal: true,
            deposit: true,
            realmtransfer: true,
            transfer: true,
            refund: true,
            getUserAccounts: true,
            getUserIbans: true,
            createIban: true,
            deleteIban: true,
            getBanks: true,
            getCurrency: true,
            proxyTransfer: true,
            getTransferStatus: true,
            getTransfers: true,
            getUserAccount: true,
            updateUserAccount: true,
            getAllWalletsAmountInSameCurrency: true,
            getXls: true,
            getBusinessTypes: true,
            massPayment: true,
            getAccountsStatus: true,
            exchange: true,
            getTransactions: true,
            getAccountsByCurrency: true,
            getTechAccByMerchant: true,
            removeOrder: true,
            removeTransfer: true,
            withdrawalCustomExchangeRate: true,
            writeWithdrawalStatement: true,
            downloadWithdrawalStatements: true,
            createWallet: true
          },
          "ccoin-service": {
            deposit: true,
            completeTransfer: true,
            getAddress: true,
            provideDeferred: true,
            validateAddress: true,
            validateAddresses: true
          },
          "kyc-service": {
            checkPushedFile: true,
            pushFile: true,
            pullFile: true,
            delFile: true,
            acceptFile: true,
            statusFile: true,
            saveProfileKYC: true,
            saveAddressKYC: true,
            saveCompanyKYC: true,
            rejectProfileKYC: true,
            rejectAddressKYC: true,
            rejectCompanyKYC: true,
            resolveProfileKYC: true,
            resolveAddressKYC: true,
            resolveCompanyKYC: true,
            legalConfirmation: true,
            generateVerificationCode: true,
            verifyPhone: true,
            sendCode: true,
            verifyEmail: true
          },
          "mail-service": {
            send: true
          },
          "support-service": {
            createTicket: true,
            createComment: true,
            getTickets: true,
            getComments: true,
            reopenTicket: true,
            sendNotification: true,
            getNotifications: true
          },
          "telegram-service": {
            send: true
          },
          "merchant-service": {
            createMerchant: true,
            getMerchants: true,
            updateMerchant: true,
            getMerchant: true,
            addContract: true,
            uploadFile: true,
            createOrder: true
          },
          "currency-service": {
            getRates: true
          },
          "statement-service": {
            sendStatement: true
          },
          "callback-service": {
            setProcessed: true,
            setRefund: true,
            setCanceled: true
          },
          "falcon-service": {
            withdrawal: true
          }
        }
      },
      {
        where: {
          id: ENV.realmId
        }
      }
    );

    await db.letter.update(
      {
        realm: ENV.realmId
      },
      {
        where: {
          from_email: "jmihvalera1357@yandex.ru"
        }
      }
    );
    await memstore.del("srv" + realmToken);

    await db.transporter.truncate();
    await db.letter.truncate();
    await db.transporter.create({
      id: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2ddcce4",
      host_transporter: "smtp.ethereal.email",
      port_transporter: 587,
      secure_transporter: false,
      user_transporter: "waino.bogan@ethereal.email",
      password_transporter: "FGfhm3HVqaVdwjK4Cb"
    });
    await db.letter.create({
      id: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2bdcce4",
      transporter: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2ddcce4",
      realm: realmId,
      code: "TXLIST",
      letter_name: "Транзакции",
      from_email: "zabbix.notifications@yandex.ru",
      to_email: "ag103@tadbox.com",
      subject: "Транзакции пользователя ",
      text: "Ваши транзакции",
      html: `doctype html
head
p Ваши транзакции
table.table
thead
  tr
  each columnName in data.body.list[0]
    th= columnName
tbody
each row in data.body.list
  tr
    td= row.tx_date
    td= row.tx_acc
    td= row.tx_amount`
    });
    await db.categories_merchant.truncate();
    await db.categories_merchant.create({
      id: "53f84645-c509-4cbf-9689-0ff8f58afccc",
      code: "CAT1",
      name: "First category"
    });
    await db.categories_merchant.create({
      id: "23a87798-8671-4130-86f7-a1165d28474a",
      code: "CAT2",
      name: "Second category"
    });
  });
  after(async () => {
    await db.profile_kyc.truncate();
    await db.address_kyc.truncate();
    await db.company_kyc.truncate();
  });

  describe("Checking token and domain", async () => {
    let data = {
      header: {
        id: 111,
        version: config.apiVersion,
        service: "auth-service",
        method: "signup"
      },
      data: {
        type: 0,
        email: "test@test.ru",
        first_name: "first_name",
        last_name: "last_name",
        middle_name: "middle_name",
        city: "city",
        street: "street",
        house: "house",
        apartment: "apartment",
        last_name: "last_name",
        birthday: "01.01.1990",
        password: "Passw0rd!#"
      }
    };
    it("Valid realm token required", async () => {
      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("Origin", "http://" + realmHost)
          .set("content-type", "application/json")
          .set("authorization", "bearerA" + realmToken)
          .send(data)
      );
      res.body.header.should.have.deep.property("status", "ERROR");
    });

    it("Wrong realm host", async () => {
      const res = await doc(
        chai
          .request(server)
          .post("/")
          .set("Origin", "http://ru")
          .set("content-type", "application/json")
          .set("authorization", "bearer" + realmToken)
          .send(data)
      );

      res.body.header.status.should.equal("ERROR");
      res.body.error.code.should.equal("WRONGREALMHOST");
    });
  });
  describe("Checking signup and sign in", async () => {
    it("Get captcha", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "getCaptcha"
        },
        data: {
          token: sessionId
        }
      };
      const res = await sendRequest(data);

      res.body.data.should.have.deep.property("data");
    });

    // Registration of personal account
    // You need get captcha by separate request (see above)
    // kyc object is optional
    it("Signup personal user", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "signup"
        },
        data: {
          type: 0,
          first_name: "first_name",
          last_name: "last_name",
          middle_name: "middle_name",
          country: "RU",
          last_name: "last_name",
          birthday: "01.01.1990",
          // password: "Passw0rd!#",
          email: "test-gate@test.ru",
          token: sessionId,
          city_addr1: "city",
          street_addr1: "street",
          house_addr1: "house",
          apartment_addr1: "app",

          captcha: await memstore.get("cpt" + sessionId)
        }
      };

      const res = await sendRequest(data);
      global.refUserSender = res.body.data;
      res.body.header.should.have.deep.property("status", "OK");
      await db.user.update(
        { temp_pass: "50c3523e8730624aa305cd937bfae919ba5aa08b" },
        { where: { id: res.body.data.id } }
      );
    });

    // it("Activate personal user", async () => {
    //   let data = {
    //     header: {
    //       id: 111,
    //       version: config.apiVersion,
    //       service: "auth-service",
    //       method: "activate"
    //     },
    //     data: {
    //       user_id: global.refUserSender.id,
    //       code: global.refUserSender.activateCode
    //     }
    //   };

    //   const res = await sendRequest(data);

    //   res.body.header.should.have.deep.property("status", "OK");

    //   let usr = await db.user.findOne({
    //     where: { id: global.refUserSender.id }
    //   });
    //   usr.dataValues.should.have.deep.property("activated", true);

    //   await db.user.update(
    //     { activated: false },
    //     { where: { id: global.refUserSender.id } }
    //   );
    // });
    // it("Activate already activated personal user", async () => {
    //   let data = {
    //     header: {
    //       id: 111,
    //       version: config.apiVersion,
    //       service: "auth-service",
    //       method: "activate"
    //     },
    //     data: {
    //       user_id: global.refUserSender.id,
    //       code: global.refUserSender.activateCode
    //     }
    //   };

    //   try {
    //     const res = await sendRequest(data);
    //   } catch (e) {
    //     expect(e.actual).to.equal("ALREADYACTIVATED");
    //   }
    // });

    // Registration of corporative account
    // You need get captcha by separate request (see above)
    // kyc object is optional
    it("Signup corporate user", async () => {
      let r = await chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send({
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "getCaptcha"
          },
          data: {
            token: sessionId
          }
        });

      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "signup"
        },
        data: {
          type: 1,
          email: "corp@test.ru",
          first_name: "first_name",
          last_name: "last_name",
          birthday: "01.01.1990",
          legalname: "Company",
          // password: "Passw0rd!#",
          token: sessionId,
          captcha: await memstore.get("cpt" + sessionId),
          middle_name: "middle_name",
          country: "RU",
          city_addr1: "city",
          street_addr1: "street",
          house_addr1: "house",
          apartment_addr1: "app",
          phone: "+11238389951"
        }
      };
      const res = await sendRequest(data);
      global.refUserDepended = res.body.data;

      res.body.header.should.have.deep.property("status", "OK");

      await db.user.update(
        {
          kyc: true,
          ref_user: null,
          temp_pass: "50c3523e8730624aa305cd937bfae919ba5aa08b"
        },
        { where: { id: res.body.data.id } }
      );
    });

    // Login of user under realm session
    it("Signin user (first time)", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "signin"
        },
        data: {
          login: "corp@test.ru",
          password: "Passw0rd!#"
        }
      };
      await db.user.update(
        { otp_transport: "test" },
        { where: { login: "corp@test.ru" } }
      );

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data)
        .to.have.property("otp_token")
        .that.is.a("string");
      expect(res.body.data).to.have.deep.property("channel", "test");
      expect(res.body.data)
        .to.have.property("available_channels")
        .that.is.an("array")
        .and.have.lengthOf(2);
      otp_token = res.body.data.otp_token;
    });

    it("Resend authorization otp (first time)", async () => {
      let otpData = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "resendAuthOtp"
        },
        data: {
          otp_token,
          channel: "email"
        }
      };
      const res = await sendRequest(otpData);
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data)
        .to.have.property("otp_token")
        .that.is.a("string");
      expect(res.body.data).to.have.deep.property("channel", "email");
      expect(res.body.data)
        .to.have.property("available_channels")
        .that.is.an("array")
        .and.have.lengthOf(2);
    });

    it("Check authorization otp (first time)", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "checkAuthOtp"
        },
        data: {
          otp: "111111",
          otp_token
        }
      };
      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data)
        .to.have.property("otp_token")
        .that.is.a("string");
      expect(res.body.data).to.have.deep.property("temp_pass", true);
    });

    it("Set permanent password and get authorization token (first time)", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "setPermanentPassword"
        },
        data: {
          otp_token,
          password: "Passw0rd!#"
        }
      };
      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data)
        .to.have.property("user_token")
        .that.is.a("string");
      global.userToken = res.body.data.user_token;
      global.userId = await memstore.get("usr" + res.body.data.user_token);
    });

    it("Sign out user", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "signout",
          token: global.userToken
        },
        data: { token: global.userToken }
      };

      let storedUserTokenFull = await memstore.get("usr" + global.userToken);
      expect(storedUserTokenFull).to.be.a("string");
      let signOutRes = await sendRequest(data);
      signOutRes.body.data.should.have.deep.property("success", true);
      let storedUserTokenEmpty = await memstore.get("usr" + global.userToken);
      expect(storedUserTokenEmpty).to.be.null;
    });

    it("Send restore password code", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "sendRestorePasswordCode"
        },
        data: {
          email: "corp@test.ru"
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
      res.body.data.should.have.deep.property("code");

      restoreCode = res.body.data.code;
    });

    it("Restore password", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "restorePassword"
        },
        data: {
          code: restoreCode,
          new_password: "Passw0rd!@"
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
    });

    it("Signin user with permanent password", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "signin"
        },
        data: {
          login: "corp@test.ru",
          password: "Passw0rd!@"
        }
      };
      await db.user.update(
        { otp_transport: "test" },
        { where: { login: "corp@test.ru" } }
      );

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data)
        .to.have.property("otp_token")
        .that.is.a("string");
      expect(res.body.data).to.have.deep.property("channel", "test");
      expect(res.body.data)
        .to.have.property("available_channels")
        .that.is.an("array")
        .and.have.lengthOf(2);
      otp_token = res.body.data.otp_token;

      let otp_request_data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "checkAuthOtp"
        },
        data: {
          otp: "111111",
          otp_token
        }
      };
      const otp_result = await sendRequest(otp_request_data);
      otp_result.body.header.should.have.deep.property("status", "OK");

      expect(otp_result.body.data)
        .to.have.property("user_token")
        .that.is.a("string");
      global.userToken = otp_result.body.data.user_token;
      global.userId = await memstore.get(
        "usr" + otp_result.body.data.user_token
      );
    });

    it("Signin user through child realm", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "signin"
        },
        data: {
          login: "corp@test.ru",
          password: "Passw0rd!@"
        }
      };
      await db.user.update(
        { otp_transport: "test" },
        { where: { login: "corp@test.ru" } }
      );

      const res = await chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + childRealmToken)
        .send(data);
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data)
        .to.have.property("otp_token")
        .that.is.a("string");
      expect(res.body.data).to.have.deep.property("channel", "test");
      expect(res.body.data)
        .to.have.property("available_channels")
        .that.is.an("array")
        .and.have.lengthOf(2);
      otp_token = res.body.data.otp_token;

      let otp_request_data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "checkAuthOtp"
        },
        data: {
          otp: "111111",
          otp_token
        }
      };
      const otp_result = await chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + childRealmToken)
        .send(otp_request_data);
      otp_result.body.header.should.have.deep.property("status", "OK");

      expect(otp_result.body.data)
        .to.have.property("user_token")
        .that.is.a("string");
      global.userToken = otp_result.body.data.user_token;
      userToken = global.userToken;
      global.userId = await memstore.get(
        "usr" + otp_result.body.data.user_token
      );
    });

    it("Child realm has access just to signin method ", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "signin"
        },
        data: {
          login: "corp@test.ru",
          password: "Passw0rd!@"
        }
      };

      const res = await chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + childRealmToken)
        .send({
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "getCaptcha"
          },
          data: {
            token: sessionId
          }
        });
      res.body.header.should.have.deep.property("status", "ERROR");
      res.body.error.should.have.deep.property("code", "SERVERACCESSDENIED");
    });

    it("Accept cookie", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "acceptCookie",
          token: userToken
        },
        data: {}
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Change password: Passwords do not match", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "changePassword"
        },
        data: {
          password: "Passw0rd",
          new_password: "Passw0rd#!"
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "ERROR");
    });

    it("Successful user password change", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "changePassword",
          token: userToken
        },
        data: {
          password: "Passw0rd!#",
          new_password: "Passw0rd#!"
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Successful user secret question change", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "changeSecretQuestion",
          token: userToken
        },
        data: {
          secret_question: "Question",
          secret_answer: "Answer"
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Change phone", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "changePhone",
          token: userToken
        },
        data: {
          new_phone: "202-555-0140"
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Change OTP channel (not available channel)", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "changeOtpChannel",
          token: userToken
        },
        data: {
          channel: "emaail"
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "ERROR");
      expect(res.body.error.code).to.equal("NOT_AVAILABLE_CHANNEL");
    });

    it("Change OTP channel (success)", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "changeOtpChannel",
          token: userToken
        },
        data: {
          channel: "email"
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
    });

    it("Change OTP channel (test)", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "changeOtpChannel",
          token: userToken
        },
        data: {
          channel: "test"
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
    });

    it("Change to corporate", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "changeToCorporate",
          token: userToken
        },
        data: {}
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    it("Get referals", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "getReferals",
          token: userToken
        },
        data: {}
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
    });

    it("2FA Google generate QR", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "googleAuthGenerateQR",
          token: userToken
        },
        data: {
          login: "corp@test.ru"
        }
      };
      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep
        .property("secret_key")
        .to.not.be.a("undefined");
      res.body.data.should.have.deep
        .property("qr_code")
        .to.not.be.a("undefined");
    });
    it("2FA Google Verify Method", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "auth-service",
          method: "googleAuthVerify",
          token: userToken
        },
        data: {
          login: "corp@test.ru",
          user_token: "2ER6T5"
        }
      };
      try {
        const res = await sendRequest(data);
        res.body.header.should.have.deep.property("status", "OK");
        res.body.data.should.have.deep
          .property("verified")
          .to.not.be.a("undefined");
      } catch (e) {
        expect(e.actual).to.equal("ERROR");
      }
    });

    describe("Check file provider", async () => {
      it("Upload file", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "kyc-service",
            method: "checkPushedFile",
            token: userToken
          },
          data: {
            files: [
              {
                name: "avatar.png",
                data: file_data
              }
            ]
          }
        };

        const res = await sendRequest(data, false);

        res.body.header.should.have.deep.property("status", "OK");
        expect(res.body.data.files[0].code).to.be.a.uuid();
        expect(res.body.data.files).to.have.deep.members([
          {
            name: "avatar.png",
            code: res.body.data.files[0].code,
            size: res.body.data.files[0].size
          }
        ]);
      }).timeout(10000);
    });

    describe("Upload avatar and legal confirmation", async () => {
      it("Avatar upload", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "avatarUpload",
            token: userToken
          },
          data: {
            files: [
              {
                name: "avatar.png",
                data: file_data
              }
            ]
          }
        };
        const res = await sendRequest(data);

        res.body.header.should.have.deep.property("status", "OK");
      }).timeout(5000);
      it("Legal confirmation", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "kyc-service",
            method: "legalConfirmation",
            token: userToken
          },
          data: {}
        };
        const res = await sendRequest(data);

        res.body.header.should.have.deep.property("status", "OK");
      });

      it("Update profile", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "updateProfile",
            token: userToken
          },
          data: {
            first_name: "firstname",
            last_name: "lastname"
          }
        };
        const res = await sendRequest(data);
        res.body.header.should.have.deep.property("status", "OK");
      });
    });

    describe("Verify phone methods", async () => {
      it("Generate verification code", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "kyc-service",
            method: "generateVerificationCode",
            token: userToken
          },
          data: {}
        };

        const res = await sendRequest(data);

        verification_code = res.body.data.code;
        res.body.header.should.have.deep.property("status", "OK");
        res.body.data.should.have.deep.property("code").not.to.be.a("null");
      });
      it("Verify phone", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "kyc-service",
            method: "verifyPhone",
            token: userToken
          },
          data: {
            code: verification_code
          }
        };

        const res = await sendRequest(data);

        res.body.header.should.have.deep.property("status", "OK");
      });
    });
  });

  describe("Save KYC data methods", async () => {
    it("Profile data", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "kyc-service",
          method: "saveProfileKYC",
          token: userToken
        },
        data: {
          first_name: "fname",
          middle_name: "mname",
          last_name: "lname",
          issue_date: "09/26/2019",
          doc_num: 123,
          doc_type: "Passport",
          files: [
            {
              name: "passport.png",
              data: file_data
            },
            {
              name: "passport.jpg",
              data: file_data
            }
          ]
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
      res.body.data.should.have.deep
        .property("kyc_id")
        .to.not.be.a("undefined");
      KYCId.profile = res.body.data.kyc_id;
    }).timeout(5000);

    it("Address data", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "kyc-service",
          method: "saveAddressKYC",
          token: userToken
        },
        data: {
          country: "Russia",
          state: "Some obl",
          city: "Some City",
          zip_code: 11201,
          address_type: "Actual",
          doc_type: "Electricity Bill",
          issue_date: "09/26/2019",
          files: [
            {
              name: "passport.png",
              data: file_data
            }
          ]
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
      res.body.data.should.have.deep
        .property("kyc_id")
        .to.not.be.a("undefined");
      KYCId.address = res.body.data.kyc_id;
    }).timeout(5000);
    it("Company data", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "kyc-service",
          method: "saveCompanyKYC",
          token: userToken
        },
        data: {
          name: "some name",
          registrar_name: "some registrar name",
          tax_number: 435,
          business_type: "Servers",
          registration_number: 6456786,
          registration_country: "Russia",
          registration_date: "09/26/2010",
          years_in_business: 9,
          numbers_of_employees: "Between 200 and 300",
          incorporation_form: "Between 25 and 100",
          date_of_last_financial_activity_report: "09/26/2019",
          use_trade_licence: "Yes",
          directors: "some directors",
          shareholders: "some shareholders",
          beneficial_owner: "some beneficial owner",
          phone: "56773245365",
          files: [
            {
              name: "company_charter.png",
              data: file_data
            }
          ]
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
      res.body.data.should.have.deep
        .property("kyc_id")
        .to.not.be.a("undefined");
      KYCId.company = res.body.data.kyc_id;
    }).timeout(5000);
  });

  describe("Resolve KYC data methods", async () => {
    it("Profile data", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "kyc-service",
          method: "resolveProfileKYC",
          token: userToken
        },
        data: {
          id: KYCId.profile,
          user_kyc_id: global.ENV.user1.id
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
    });
    it("Address data", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "kyc-service",
          method: "resolveAddressKYC",
          token: userToken
        },
        data: {
          id: KYCId.address,
          user_kyc_id: global.ENV.user1.id
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
    });
    it("Company data", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "kyc-service",
          method: "resolveCompanyKYC",
          token: userToken
        },
        data: {
          id: KYCId.company,
          user_kyc_id: global.ENV.user1.id
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
    });
  });

  describe("Reject KYC data methods", async () => {
    it("Profile data", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "kyc-service",
          method: "rejectProfileKYC",
          token: userToken
        },
        data: {
          id: KYCId.profile,
          user_kyc_id: global.ENV.user1.id
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
    });
    it("Address data", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "kyc-service",
          method: "rejectAddressKYC",
          token: userToken
        },
        data: {
          id: KYCId.address,
          user_kyc_id: global.ENV.user1.id
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
    });
    it("Company data", async () => {
      await db.user.update(
        { variables: { _arr: [{ key: "EXCHANGE_FEE", value: 2 }] } },
        { where: { login: "corp@test.ru" } }
      );

      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "kyc-service",
          method: "rejectCompanyKYC",
          token: userToken
        },
        data: {
          id: KYCId.company,
          user_kyc_id: global.ENV.user1.id
        }
      };

      const res = await sendRequest(data);
      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("success", true);
    });
    describe("Upload, update and get documents, framework agreement", () => {
      it("Upload document", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "uploadDocument",
            token: userToken
          },
          data: {
            files: [
              {
                name: "avatar.png",
                data: file_data
              }
            ],
            type: "29a74bb9-bbf4-4e96-8360-602f2aa5fb33",
            status: 1
          }
        };
        const res = await sendRequest(data);

        res.body.data.should.have.deep.property("success", true);
      });
      it("Update document", async () => {
        const doc = await db.user_documents.findOne({
          where: {
            type: "29a74bb9-bbf4-4e96-8360-602f2aa5fb33",
            status: 1
          }
        });
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "updateDocument",
            token: userToken
          },
          data: {
            id: doc.id,
            files: [
              {
                name: "avatar.png",
                data: file_data
              }
            ],
            type: "29a74bb9-bbf4-4e96-8360-602f2aa5fb33",
            status: 1
          }
        };
        const res = await sendRequest(data);
        res.body.data.should.have.deep.property("success", true);
      });
      it("Get all user documents", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "getUserDocuments",
            token: userToken
          },
          data: {}
        };
        const res = await sendRequest(data);

        res.body.data.should.have.deep.property("success", true);
        res.body.data.should.have.deep
          .property("userDocList")
          .to.not.be.a("undefined");
      });

      it("Did user signed framed agreement", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "auth-service",
            method: "didUserSignedFramedAgreement",
            token: userToken
          },
          data: {}
        };
        const res = await sendRequest(data);

        res.body.data.should.have.deep.property("success", true);
        res.body.data.should.have.deep
          .property("flag")
          .to.not.be.a("undefined");
      });

      // it("Get white list countries", async () => {
      //   let data = {
      //     header: {
      //       id: 111,
      //       version: config.apiVersion,
      //       service: "auth-service",
      //       method: "getWhiteListCountries"
      //     },
      //     data: {}
      //   };
      //   const res = await sendRequest(data);

      //   res.body.data.should.have.deep.property("success", true);
      //   // res.body.data.should.have.deep
      //   //   .property("flag")
      //   //   .to.not.be.a("undefined");
      // });

      // it("Check VAT number", async () => {
      //   let data = {
      //     header: {
      //       id: 111,
      //       version: config.apiVersion,
      //       service: "auth-service",
      //       method: "checkVAT"
      //     },
      //     data: { vat_num: "26375245", country_code: "LU" }
      //   };
      //   const res = await sendRequest(data);

      //   res.body.data.should.have.deep.property("countryCode", "LU");
      //   res.body.data.should.have.deep.property("vatNumber", "26375245");
      //   res.body.data.should.have.deep.property("valid", true);
      //   res.body.data.should.have.deep.property(
      //     "name",
      //     "AMAZON EUROPE CORE S.A R.L."
      //   );
      //   res.body.data.should.have.deep.property(
      //     "address",
      //     "38, AVENUE JOHN F. KENNEDY, L-1855  LUXEMBOURG"
      //   );
      // });

      /*it("Sumsub send document", async () => {
        let data = {
          header: {
            id: 111,
            version: config.apiVersion,
            service: "sumsub-service",
            method: "sendDocument",
            token: userToken
          },
          data: {
            applicantId: 123,
            idDocType: "PASSPORT",
            idDocSubType: "FRONT_SIDE",
            country: "RUS",
            firstName: null,
            middleName: null,
            lastName: null,
            issuedDate: null,
            validUntil: null,
            number: null,
            dob: null,
            placeOfBirth: null,
            files: [
              {
                name: "document.png",
                data: file_data
              }
            ]
          }
        };

        const res = await sendRequest(data, false);

        res.body.header.should.have.deep.property("status", "OK");
      });*/
    });
  });
  // describe("System Notifications", async () => {
  //   it("Get System Notifications", async () => {
  //     let data = {
  //       header: {
  //         id: 111,
  //         version: config.apiVersion,
  //         service: "auth-service",
  //         method: "getSystemNotifications"
  //       },
  //       data: {}
  //     };
  //     const res = await sendRequest(data);
  //     res.body.header.should.have.deep.property("status", "OK");
  //     res.body.data.should.have.deep.property("success", true);
  //   });
  // });
  // describe("Mail service", async () => {
  //   it("Mail service", async () => {
  //     let data = {
  //       header: {
  //         id: 111,
  //         version: config.apiVersion,
  //         service: "mail-service",
  //         method: "send",
  //         token: userToken
  //       },
  //       data: {
  //         code: "TXLIST",
  //         to: "ag103@tadbox.com",
  //         body: {
  //           username: "Alex",

  //           date: "01.01.2019",
  //           list: [
  //             {
  //               tx_date: "01.01.2019",
  //               tx_acc: "12321",
  //               tx_amount: 111
  //             },
  //             {
  //               tx_date: "01.01.2019",
  //               tx_acc: "12321",
  //               tx_amount: 111
  //             },
  //             {
  //               tx_date: "01.01.2019",
  //               tx_acc: "12321",
  //               tx_amount: 111
  //             }
  //           ]
  //         }
  //       }
  //     };

  //     const res = await doc(
  //       chai
  //         .request(server)
  //         .post("/")
  //         .set("content-type", "application/json")
  //         .set("authorization", "bearer" + realmToken)
  //         .send(data)
  //     );
  //     res.body.header.should.have.deep.property("status", "OK");
  //   }).timeout(5000);
  // });
});
