import Base from "@lib/base";
import Support from "./lib/Support";
import Messages from "./lib/Messages";

export default class Service extends Base {
  publicMethods() {
    return {
      serviceDescription: {},
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods"
      },
      getTickets: {
        realm: true,
        user: true,
        method: Support.getTickets,
        description: "get tickets"
      },
      createTicket: {
        realm: true,
        user: true,
        method: Support.createTicket,
        description: "create ticket",
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            // category: { type: "string" },
            message: { type: "string" },
            files: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  data: { type: "string" }
                }
              }
            },
            is_user_message: { type: "boolean" }
          },
          required: ["title", "message", "is_user_message"]
        }
      },
      getComments: {
        realm: true,
        user: true,
        method: Support.getComments,
        description: "get comments",
        schema: {
          type: "object",
          properties: {
            ticketId: { type: "string" }
          },
          required: ["ticketId"]
        }
      },
      createComment: {
        realm: true,
        user: true,
        method: Support.createComment,
        description: "create comment",
        schema: {
          type: "object",
          properties: {
            ticket_id: { type: "string" },
            message: { type: "string" },
            files: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  data: { type: "string" }
                }
              }
            },
            is_user_message: { type: "boolean" }
          },
          required: ["ticket_id", "message", "is_user_message"]
        }
      },
      reopenTicket: {
        realm: true,
        user: true,
        method: Support.reopenTicket,
        description: "reopen ticket",
        schema: {
          type: "object",
          properties: {
            ticket_id: { type: "string" }
          },
          required: ["ticket_id"]
        }
      },
      getNotifications: {
        realm: true,
        user: true,
        method: Support.getNotifications,
        description: "get user notifications",
        schema: {
          type: "object",
          properties: {
            start: { type: "integer" },
            limit: { type: "integer" },
            is_new: { type: "integer" },
            mark_is_read: { type: "boolean" }
          },
          required: ["is_new", "mark_is_read"]
        }
      },
      sendNotification: {
        realm: true,
        user: true,
        method: Support.sendNotification,
        description: "send notification",
        schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            sender: { type: "string" },
            user_id: { type: "string" }
          },
          required: ["message", "sender", "user_id"]
        }
      },

      getMessages: {
        realm: true,
        user: true,
        method: Messages.getMessages,
        schema: {
          type: "object",
          properties: {
            start: { anyof: [{ type: "string" }, { type: "number" }] },
            limit: { anyof: [{ type: "string" }, { type: "number" }] }
          },
          required: []
        }
      },

      sendMessage: {
        realm: true,
        user: true,
        method: Messages.sendMessage,
        schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            files: { type: "array" },
            get_messages: { type: "boolean" }
          },
          required: ["message"]
        }
      },
      markAsRead: {
        realm: true,
        user: true,
        method: Messages.markAsRead,
        schema: {
          type: "object",
          properties: {
            message_id: { anyof: [{ type: "string" }, { type: "number" }] }
          },
          required: ["message_id"]
        }
      },
      getAdminDialogsList: {
        private: true,
        method: Messages.getAdminDialogsList,
        schema: {
          type: "object",
          properties: {},
          required: []
        }
      }
    };
  }

  async ping(data) {
    console.log("ping");
    return {
      "test-pong": true
    };
  }
}
