import chai, { expect } from "chai";
let should = chai.should();
import pretest from "@lib/pretest";
import db from "@lib/db";

import Service from "../src/Service.js";
const service = new Service({
  name: "mail-service"
});

let ENV;

describe("Mail service", async () => {
  before(async () => {
    ENV = await pretest.before();

    await db.transporter.destroy({ truncate: true, cascade: true });
    await db.letter.destroy({ truncate: true, cascade: true });

    const transport = await db.transporter.create({
      host_transporter: "email-smtp.eu-west-1.amazonaws.com",
      port_transporter: 465,
      secure_transporter: true,
      user_transporter: "AKIARN4RA6JA7TWO7UU5",
      password_transporter: "BLryBG5jTADcei0He37W56IRfQxe4mb335LzZ3jGvuzO"
    });

    await db.letter.create({
      realm: ENV.realmId,
      transporter: transport.get("id"),
      code: "TXLIST",
      letter_name: "test",
      from_email: "info@falcontransfer.com",
      to_email: "",
      subject: "test mail",
      text: "test mail body text",
      html: `strong test mail body html`,
      type: 1
    });
  });

  after(async () => {});

  describe("Mail service", () => {
    it("Get user notification settings", async () => {
      const res = await service.runServiceMethod({
        method: "getNotificationEvents",
        data: {},
        realmId: ENV.realmId,
        userId: ENV.user3.id
      });
      expect(res)
        .to.have.property("settings")
        .that.is.an("array")
        .and.have.lengthOf(1);
    });
    it("Update user notification settings", async () => {
      const res = await service.runServiceMethod({
        method: "updateNotificationEvents",
        data: {
          channels: [{ code: "TXLIST", channels: ["email", "sms"] }]
        },
        realmId: ENV.realmId,
        userId: ENV.user3.id
      });
      expect(res).to.have.deep.property("success", true);
    });
    // it("Send user personal notification", async () => {
    //   const res = await service.runServiceMethod({
    //     method: "send",
    //     data: {
    //       to: "testuser3@user.com",
    //       body: {},
    //       code: "TXLIST"
    //     },
    //     realmId: ENV.realmId
    //   });
    //   expect(res).to.have.deep.property("success", true);
    // });
    /*it("Check sms", async () => {
      var data = {
        code: "TXLIST",
        to: "79859530704",
        body: {
          username: "Alex"
        }
      };
      const res = await service.runServiceMethod({
        method: "sms",
        data,
        realmId: ENV.realmId
      });
      res.should.have.deep.property("success", true);
    });
*/
    it("Should send data to user", async () => {
      /*var data = {
        code: "TXLIST",
        to: "mt101@tadbox.com",
        body: {
          username: "Alex",
          date: "01.01.2019",
          list: [
            {
              tx_date: "01.01.2019",
              tx_acc: "12321",
              tx_amount: 111
            },
            {
              tx_date: "01.01.2019",
              tx_acc: "12321",
              tx_amount: 111
            },
            {
              tx_date: "01.01.2019",
              tx_acc: "12321",
              tx_amount: 111
            }
          ]
        }
      };
      const res = await service.runServiceMethod({
        method: "send",
        data,
        realmId: ENV.realmId
      });
      res.should.have.deep.property("success", true);*/
    });
  });
});
