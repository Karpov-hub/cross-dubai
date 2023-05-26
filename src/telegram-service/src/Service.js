import Base from "@lib/base";
import telegram from "./lib/telegram.js";

export default class Service extends Base {
  publicMethods() {
    return {
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods"
      },
      verifyPhoneCode: {
        realm: true,
        user: true,
        method: telegram.verifyPhoneCode,
        description: "Verify sent code for login",
        schema: {
          type: "object",
          properties: {
            phone: { type: "string" },
            code: { type: "string" }
          },
          required: ["phone", "code"]
        }
      },
      login: {
        realm: true,
        method: telegram.auth,
        description: "Login into telegram account",
        schema: {
          type: "object",
          properties: {
            phone: { type: "string" }
          },
          required: ["phone"]
        }
      },
      createChannel: {
        realm: true,
        user: true,
        method: telegram.createChannel,
        description: "Create telegram channel",
        schema: {
          type: "object",
          properties: {
            ref_id: { anyOf: [{ type: "string" }, { type: "array" }] },
            title: { type: "string" },
            about: { type: "string" }
          },
          required: ["ref_id", "title"]
        }
      },
      sendMessage: {
        private: true,
        method: telegram.sendMessage,
        description: "Send message to telegram channel",
        schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            ref_id: { type: "string" }
          },
          required: ["message", "ref_id"]
        }
      },
      deleteChannel: {
        realm: true,
        user: true,
        method: telegram.deleteChannel,
        description: "Create telegram channel",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" }
          },
          required: ["id"]
        }
      },
      editAdmin: {
        private: true,
        method: telegram.editAdmin,
        description: "Edit admin channel",
        schema: {
          type: "object",
          properties: {
            ref_id: { type: "string" },
            user_name: { type: "string" }
          },
          required: ["ref_id", "user_name"]
        }
      },
      logout: {
        realm: true,
        user: true,
        method: telegram.logout,
        description: "Logs out the user",
        schema: {
          type: "object",
          properties: {
            telegram_app: { type: "string" }
          },
          required: ["telegram_app"]
        }
      },
      editChannelName: {
        realm: true,
        user: true,
        method: telegram.editChannelName,
        description: "Edit channel name",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" }
          },
          required: ["id", "title"]
        }
      }
    };
  }
}
