import Base from "@lib/base";

export default class Service extends Base {
  publicMethods() {
    return {
      serviceDescription: {},
      ping: {
        description: "Test ping-pong method",
        schema: {
          type: "object",
          properties: {
            text: { type: "string" },
            num: { type: "number" },
          },
          required: ["text"],
        },
      },
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods",
      },
    };
  }

  async ping() {
    console.log("ping");
    return { "test-pong": true, language: arguments[7].lang };
  }
}
