"use strict";

const fs = require("fs");
const Queue = require("@lib/queue");
const path = require("path");
const Sequelize = require("sequelize-enovate");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

function getRealmFromData(data) {
  for (let k in data) {
    if (/^realm/.test(k) && /^[a-f0-9\-]{36}$/.test(data[k])) return data[k];
  }
  return null;
}

async function createWF(data, attributes) {
  const realm = getRealmFromData(data);

  let signset;

  if (realm) {
    const where = {
      module: this.adminModelName.replace(/\./g, "-"),
      realm
    };

    signset = await db.signset.findOne({
      where
    });

    if (signset && signset._id) {
      data.signobject = { shouldSign: true };
    }
  }

  const res = await this.create(data, attributes);

  if (
    signset &&
    signset._id &&
    signset.priority &&
    signset.priority._arr &&
    signset.priority._arr[0]
  ) {
    Queue.broadcastJob("call-admin", {
      model: this.adminModelName,
      method: "sendWorkflowMessage",
      data: {
        record: res.toJSON(),
        receiver: signset.priority._arr[0]
      }
    });
  } else {
    Queue.broadcastJob("call-admin", {
      model: this.adminModelName,
      method: "onChange",
      data: res.toJSON()
    });
  }

  return res;
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = sequelize["import"](path.join(__dirname, file));

    //console.log(Object.keys(model).join(","));
    //console.log(model.rawAttributes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
    if (!!db[modelName].rawAttributes.signobject) {
      db[modelName].createWF = createWF;
    }
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
