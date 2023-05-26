import redis from "ioredis";
import config from "@lib/config";

const redisClient = new redis(config.redis || null);

function checkConnect() {
  return new Promise((resolve, reject) => {
    const f = () => {
      if (redisClient.status == "ready") resolve();
      else {
        setTimeout(() => {
          f();
        }, 500);
      }
    };
    f();
  });
}

export default class MemStore {
  static set(key, val, ex) {
    return new Promise(async (resolve, reject) => {
      await checkConnect();
      if (ex) {
        redisClient.set(key, val, "EX", ex, (e, d) => {
          if (e) reject(e);
          else resolve(d);
        });
      } else {
        redisClient.set(key, val, (e, d) => {
          if (e) reject(e);
          else resolve(d);
        });
      }
    });
  }
  static get(key) {
    return new Promise(async (resolve, reject) => {
      await checkConnect();
      redisClient.get(key, (e, d) => {
        if (e) reject(e);
        else resolve(d);
      });
    });
  }
  static del(key) {
    return new Promise(async (resolve, reject) => {
      await checkConnect();
      redisClient.del(key, (e, d) => {
        if (e) reject(e);
        else resolve(d);
      });
    });
  }
  static keys(query) {
    return new Promise(async (resolve, reject) => {
      await checkConnect();
      redisClient.keys(query, (e, d) => {
        if (e) reject(e);
        else resolve(d);
      });
    });
  }

  static exists(key) {
    return new Promise(async (resolve, reject) => {
      await checkConnect();
      redisClient.exists(key, (e, d) => {
        if (e) reject(e);
        else resolve(!!d);
      });
    });
  }
}
