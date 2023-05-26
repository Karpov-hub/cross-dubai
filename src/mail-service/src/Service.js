import Base from "@lib/base";
import db, { Sequelize } from "@lib/db";
import nodemailer from "nodemailer";
import smsGate from "./sms";
const pug = require("pug");
import uuid from "uuid/v4";
import Queue from "@lib/queue";
import config from "@lib/config";

const Op = db.Sequelize.Op;

export default class Service extends Base {
  publicMethods() {
    return {
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods"
      },
      preview: {
        description: "preview mail body"
      },
      send: {
        realm: true,
        method: this.send,
        description: "send mail"
      },
      sms: {
        realm: true,
        method: this.sendSms,
        description: "send sms"
      },
      sendNotification: {
        realm: true,
        method: this.sendNotification,
        description: "Send notification",
        schema: {
          type: "object",
          properties: {
            to: { type: "string" },
            body: { type: "object" },
            template: { type: "string" },
            channel: { type: "string" },
            lang: { type: "string" }
          },
          required: ["to", "template"]
        }
      },
      getNotificationEvents: {
        user: true,
        realm: true,
        method: this.getNotificationEvents,
        description: "Get user notification events",
        schema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      updateNotificationEvents: {
        user: true,
        realm: true,
        method: this.updateNotificationEvents,
        description: "Update user notification user",
        schema: {
          type: "object",
          properties: {
            settings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  channels: { type: "array" }
                }
              }
            }
          },
          required: ["settings"]
        }
      }
    };
  }

  buildDataForSending(data) {
    return {
      lang: data.lang ? data.lang.toLowerCase() : "en",
      code: data.template,
      to: data.to,
      body: data.body
    };
  }

  async sendNotification(data, realm_id) {
    if (!config.NEED_TO_SEND_MESSAGES) return { success: true };
    switch (data.channel) {
      case "email": {
        this.send(this.buildDataForSending(data), realm_id).catch((e) => {
          console.log("sendNotification send: ", e);
        });
        break;
      }
      case "sms": {
        this.sms(this.buildDataForSending(data), realm_id).catch((e) => {
          console.log("sendNotification sms: ", e);
        });
        break;
      }
      case "telegram": {
        this.sendTelegramMessage(data, realm_id).catch((e) => {
          console.log("sendNotification telegram: ", e);
        });
        break;
      }
      default: {
        this.send(this.buildDataForSending(data), realm_id).catch((e) => {
          console.log("sendNotification default: ", e);
        });
        break;
      }
    }
    return { success: true };
  }

  async prepareTextBeforeSending(data, realm_id) {
    let letterDetails = await this.getTemplate(
      this.buildDataForSending(data),
      realm_id
    ).catch((e) => {
      throw e;
    });
    let text = await pug
      .render(letterDetails.get("text"), this.buildDataForSending(data))
      .replace(/<[^>]{2}>/g, "\n");
    return text.replace(/<[^>]{1,}>/g, "");
  }

  async sendTelegramMessage(data, realm_id) {
    let text = await this.prepareTextBeforeSending(data, realm_id).catch(
      (e) => {
        console.log("sendTelegramMessage: ", e);
      }
    );
    let res = await Queue.newJob("telegram-service", {
      method: "sendMessage",
      data: {
        ref_id: data.to,
        message: text
      },
      realmId: realm_id
    });
    return res;
  }

  async getNotificationEvents(data, realm_id, user_id) {
    let user_notification_settings = await db.user_notification_setting.findOne(
      {
        where: {
          user_id
        },
        raw: true
      }
    );
    if (user_notification_settings?.notification_settings?._arr?.length)
      user_notification_settings =
        user_notification_settings.notification_settings._arr;

    let letter_tempaltes = await db.letter.findAll({
      where: {
        type: 1
      },
      raw: true
    });

    let distincted_letter_templates = [];
    for (let template of letter_tempaltes) {
      if (distincted_letter_templates.length) {
        let idx = distincted_letter_templates.findIndex((el) => {
          return el.code == template.code;
        });
        if (idx >= 0 && distincted_letter_templates[idx]) {
          distincted_letter_templates[idx].subject[template.lang] =
            template.subject;
          continue;
        }
      }
      distincted_letter_templates.push({
        subject: { [template.lang]: template.subject },
        code: template.code
      });
    }

    let user_data = await db.user.findOne({
      where: { id: user_id },
      attributes: ["otp_transport"],
      raw: true
    });

    if (
      user_data &&
      (user_data.otp_transport == "test" ||
        user_data.otp_transport == "google authenticator")
    )
      user_data.otp_transport = "email";

    let result = [];
    for (let { code, subject } of distincted_letter_templates) {
      let setting = {};
      if (user_notification_settings?.length)
        setting = user_notification_settings.find((el) => {
          return el.code == code;
        });
      result.push({
        subject,
        code,
        channels: setting?.channels || [
          user_data ? user_data.otp_transport : "email"
        ]
      });
    }
    return { settings: result };
  }

  async updateNotificationEvents(data, realm_id, user_id) {
    let ins_obj = {
      user_id,
      notification_settings: { _arr: data.settings }
    };
    let user_notification_settings = await db.user_notification_setting.findOne(
      { where: { user_id }, attributes: ["id"], raw: true }
    );
    if (user_notification_settings?.id)
      ins_obj.id = user_notification_settings.id;
    await db.user_notification_setting.upsert(ins_obj);
    return { success: true };
  }

  async preview(data) {
    const html = await pug.render(data.tpl, data.data);
    return { html };
  }

  async createMailTpl(data, realmId) {
    const transporter = await db.transporter.findOne({ attributes: ["id"] });

    const dd = {
      transporter: transporter.get("id"),
      realm: realmId,
      code: data.code,
      name: data.code,
      lang: data.lang ? data.lang.toLowerCase() : "en",
      data: JSON.stringify(data, null, 4)
    };

    await db.letter.create(dd);
  }

  async getTemplate(data, realmId) {
    if (!data.code) throw "THEREISNTMAILCODE";
    const attributes = [
      "id",
      "from_email",
      "subject",
      "text",
      "html",
      "transporter",
      "data"
    ];

    let letterDetails;
    letterDetails = await db.letter.findOne({
      where: {
        realm: realmId,
        code: data.code,
        lang: data.lang ? data.lang.toLowerCase() : "en"
      },
      attributes
    });

    if (!letterDetails) {
      letterDetails = await db.letter.findOne({
        where: {
          realm: realmId,
          code: data.code,
          lang: "en"
        },
        attributes
      });
    }

    if (!letterDetails) {
      await this.createMailTpl(data, realmId);
      throw "MAILTEMPLATENOTFOUND";
    }
    if (!letterDetails.get("data")) {
      await db.letter.update(
        {
          data: JSON.stringify(data, null, 4)
        },
        { where: { id: letterDetails.get("id") } }
      );
    }
    return letterDetails;
  }

  async sms(data, realmId) {
    if (
      ["staging", "localtest", "test", "development"].includes(
        process.env.NODE_ENV
      )
    )
      return { success: true };

    let letterDetails = await this.getTemplate(data, realmId).catch((e) => {
      throw e;
    });
    let text = await pug.render(letterDetails.get("text"), data);

    text = text.replace(/<[^>]{1,}>/g, "");

    const res = await smsGate.send(data.to, text);
    return {
      success: true
    };
  }

  async send(data, realmId) {
    console.log("send data: ", data);
    if (!config.NEED_TO_SEND_MESSAGES) return { success: true };

    let letterDetails = await this.getTemplate(data, realmId).catch((e) => {
      throw e;
    });

    let html = await pug.render(letterDetails.get("html"), data);
    let text = await pug.render(letterDetails.get("text"), data);
    text = text.replace(/<[^>]{1,}>/g, "");

    if (letterDetails == null) throw "NOLETTERDETAILS";

    let transporterData = await db.transporter.findOne({
      where: {
        id: letterDetails.get("transporter")
      },
      raw: true
    });

    const opt = {
      host: transporterData.host_transporter,
      port: transporterData.port_transporter,
      secureConnection: transporterData.secure_transporter,
      auth: {
        user: transporterData.user_transporter,
        pass: transporterData.password_transporter
      }
    };

    if (transporterData.secure_transporter) {
      opt.tls = {
        rejectUnauthorized: false,
        ciphers: "SSLv3"
      };
    }

    let transporter, info;
    let messOpt = {
      from: letterDetails.get("from_email"),
      subject: letterDetails.get("subject"),
      text,
      html,
      attachments: data.attachments || []
    };

    let toAddr = [];

    if (typeof data.to === "string" || data.to instanceof String) {
      toAddr = data.to.split(",");
    } else {
      toAddr = data.to;
    }

    toAddr = [...new Set(toAddr)]; // remove duplicates

    transporter = await nodemailer.createTransport(opt);

    for (let to of toAddr) {
      if (to) {
        messOpt.to = to;
        if (data.cc) messOpt.cc = data.cc;
        if (data.bcc) messOpt.bcc = data.bcc;
        try {
          info = await transporter.sendMail({
            ...messOpt
          });
          await this.saveLog("success", messOpt, info);
        } catch (e) {
          await this.saveLog("error", messOpt, e);
          return { success: false };
        }
      }
    }

    return {
      success: !!info.messageId
    };
  }

  async saveLog(status, data, response) {
    if (status == "error") {
      console.log("send mail error:");
      console.log("data:", data);
      console.log("error:", response);
      return;
    }

    let log = {
      id: uuid(),
      request: data,
      responce: response,
      service: "mail-service",
      method: "send",
      ctime: new Date(),
      removed: 0
    };

    await db.log.create(log);
  }
}
