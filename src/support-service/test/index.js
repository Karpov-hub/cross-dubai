import chai from "chai";
import db from "@lib/db";
import pretest from "@lib/pretest";
const should = chai.should();
const expect = chai.expect;

import Service from "../src/Service.js";
const service = new Service({
  name: "support-service"
});

let file = {};
file.data =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8yNy8xMxoI2XgAAAKSSURBVHic7dyxjsIwFABBfOL/f9lXXIu2cC44kJk+wlisHsVTxpxzPoCXfnYfAK5MIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AHczxlh+1ov4388EgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgWCbd9GRrdx3fqYN4GNMEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgXDrdfcdK+ur6+erZ119zpr8HxMEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEwphfsrb57s3cT7o2d7POBIEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAiXW3e3mn0Nn/Ri7zOZIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBALhtGXFb1863LHMt+IO93LmdzRBIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIDx3H+BujmyefsoG8Tc5LZDVH4IfwT1d8b28j4e/WJAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQCQSAQBAJBIBAEAkEgEAQC4bn7AP9ljLH7CJfkXo4xQSAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBMKYc87dh4CrMkEgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCAIBIJAIAgEgkAgCASCQCD8AkUtP407XiL1AAAAAElFTkSuQmCC";
let ENV;
let userId;
let ticketId;

describe("Support service", async () => {
  before(async () => {
    await db.comment.truncate();
    await db.ticket.truncate();
    ENV = await pretest.before();
    userId = ENV.user1.dataValues.id;
    await db.support_message.truncate();
  });

  after(function() {});

  describe("Create ticket and comment", () => {
    it("Create ticket", async () => {
      const res = await service.runServiceMethod({
        method: "createTicket",
        data: {
          title: "Ticket",
          category: "Withdrawal",
          message: "Problem with Withdrawal",
          files: [{ name: "passport.png", data: file.data }],
          is_user_message: true
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
      ticketId = res.ticket.ticket_id;
    });

    it("Get tickets", async () => {
      const res = await service.runServiceMethod({
        method: "getTickets",
        data: {},
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Create comment", async () => {
      const res = await service.runServiceMethod({
        method: "createComment",
        data: {
          ticket_id: ticketId,
          message: "Hi",
          files: [{ name: "passport.png", data: file.data }],
          is_user_message: true
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Get comment", async () => {
      const res = await service.runServiceMethod({
        method: "getComments",
        data: {
          ticketId: ticketId
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Reopen ticket", async () => {
      const res = await service.runServiceMethod({
        method: "reopenTicket",
        data: {
          ticket_id: ticketId
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Send notification", async () => {
      const res = await service.runServiceMethod({
        method: "sendNotification",
        data: {
          message: "New notification",
          sender: "Admin",
          user_id: userId
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Get user notifications", async () => {
      const res = await service.runServiceMethod({
        method: "getNotifications",
        data: {
          start: 0,
          limit: 10,
          is_new: 1,
          mark_is_read: true
        },
        realmId: ENV.realmId,
        userId
      });
      res.should.have.deep.property("success", true);
    });

    it("Send user message", async () => {
      const sendMessage = async (
        message,
        get_messages = false,
        attachments = null
      ) => {
        return await service.runServiceMethod({
          method: "sendMessage",
          data: { message, get_messages, files: attachments },
          realmId: ENV.realmId,
          userId
        });
      };

      const res = await sendMessage("Hello");
      res.should.have.deep.property("success", true);

      const res_with_messages = await sendMessage("there", true, [
        { name: "passport.png", data: file.data }
      ]);
      res_with_messages.should.have.deep.property("count", 2);
      res_with_messages.should.have.property("messages");
      res_with_messages.messages.should.be.an("array").and.have.length(2);

      for (let word of ["general", "Kenobi", "!"]) await sendMessage(word);
    });
    it("Get user messages", async () => {
      const getMessages = async (start, limit) => {
        return await service.runServiceMethod({
          method: "getMessages",
          data: { start, limit },
          realmId: ENV.realmId,
          userId
        });
      };
      const res = await getMessages(0, 2);
      res.should.have.property("messages");
      res.messages.should.be.an("array").and.have.length(2);

      let earlier_messages = await getMessages(2, 2);
      earlier_messages.should.have.property("messages");
      earlier_messages.messages.should.be.an("array").and.have.length(2);

      const getTimeSum = (messages) => {
        return messages.reduce(
          (acc, curr) => (acc += new Date(curr.ctime).getTime()),
          0
        );
      };
      expect(getTimeSum(res.messages)).to.be.greaterThan(
        getTimeSum(earlier_messages.messages)
      );
    });
    it("Read messages", async () => {
      const getMessages = async (is_new = true) => {
        return await db.support_message.findAll({
          where: {
            is_new
          },
          attributes: ["id"],
          raw: true
        });
      };
      const markAsRead = async (message_id) => {
        return await service.runServiceMethod({
          method: "markAsRead",
          data: { message_id },
          realmId: ENV.realmId,
          userId
        });
      };
      const init_messages = await getMessages();
      init_messages.should.be.an("array").and.have.length(5);

      const single_marking_res = await markAsRead(init_messages[0].id);
      single_marking_res.should.have.deep.property("success", true);
      const messages_after_single_marking = await getMessages();
      messages_after_single_marking.should.be.an("array").and.have.length(4);

      const multiple_marking_res = await markAsRead(
        messages_after_single_marking.map((el) => el.id)
      );
      multiple_marking_res.should.have.deep.property("success", true);
      const messages_after_multiple_marking = await getMessages();
      messages_after_multiple_marking.should.be.an("array").and.have.length(0);
    });
  });
});
