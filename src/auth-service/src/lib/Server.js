import db from "@lib/db";
import Queue from "@lib/queue";
import MemStore from "@lib/memstore";

function exceptPrivateMethods(service) {
  Object.keys(service).forEach((method) => {
    if (service[method].private) delete service[method];
  });
  return service;
}

export default class Server {
  static async getServerPermissions(data) {
    return {
      data: [
        {
          servicename: "auth-service",
          methods: ["permissedMethod", "getPublicMethods"]
        }
      ]
    };
  }

  static async permissedMethod() {
    return { authorized: true };
  }

  static async getServerByToken(data) {
    const res = await db.realm.findOne({
      where: { token: data.token },
      attributes: ["id", "permissions", "ip", "domain", "pid", "cors"]
    });
    return res ? res.toJSON() : null;
  }

  static async reset(data) {
    await MemStore.del(`srv${data.token}`);
    return { success: true };
  }

  static async getPublicMethods() {
    const results = await Queue.broadcastJob("serviceDescription");

    let data = {};
    results.forEach((service) => {
      if (!service || !service.service || !service.publicMethods) return;
      data[service.service] = exceptPrivateMethods(service.publicMethods);
    });
    return { data };
  }
}
