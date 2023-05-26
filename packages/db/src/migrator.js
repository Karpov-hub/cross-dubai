const Sequelize = require("sequelize-enovate");
const Umzug = require("umzug");
const env = process.env.NODE_ENV || "development";
const path = require("path");
const Config = require("../config/config.json");

const config = Config[env];

let sequelizeConn;

if (config.use_env_variable) {
  sequelizeConn = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelizeConn = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const umzug = new Umzug({
  storage: "sequelize",
  storageOptions: {
    sequelize: sequelizeConn,
    tableName: process.env.MIGRATE_TABLE || "SequelizeMeta",
    schema: config.schema,
    searchPath: config.schema,
    dialectOptions: {
      prependSearchPath: true
    }
  },
  logging: console.log,
  migrations: {
    params: [sequelizeConn.getQueryInterface(), Sequelize],
    path: `${__dirname}/../${process.env.MIGRATE_DIR || "migrations"}`,
    pattern: /\.js$/
  }
});

function logUmzugEvent(eventName) {
  return function(name, migration) {
    console.log(`${name} ${eventName}`);
  };
}
function cmdStatus() {
  let result = {};

  return umzug
    .executed()
    .then((executed) => {
      result.executed = executed;
      return umzug.pending();
    })
    .then((pending) => {
      result.pending = pending;
      return result;
    })
    .then(({ executed, pending }) => {
      executed = executed.map((m) => {
        m.name = path.basename(m.file, ".js");
        return m;
      });
      pending = pending.map((m) => {
        m.name = path.basename(m.file, ".js");
        return m;
      });

      const current =
        executed.length > 0 ? executed[0].file : "<NO_MIGRATIONS>";
      const status = {
        current: current,
        executed: executed.map((m) => m.file),
        pending: pending.map((m) => m.file)
      };

      return { executed, pending };
    });
}
umzug.on("migrating", logUmzugEvent("migrating"));
umzug.on("migrated", logUmzugEvent("migrated"));
umzug.on("reverting", logUmzugEvent("reverting"));
umzug.on("reverted", logUmzugEvent("reverted"));

function cmdMigrate() {
  return umzug.up();
}

function cmdMigrateNext() {
  return cmdStatus().then(({ executed, pending }) => {
    if (pending.length === 0) {
      return Promise.reject(new Error("No pending migrations"));
    }
    const next = pending[0].name;
    return umzug.up({ to: next });
  });
}

function cmdReset() {
  return umzug.down({ to: 0 });
}

function cmdResetPrev() {
  return cmdStatus().then(({ executed, pending }) => {
    if (executed.length === 0) {
      return Promise.reject(new Error("Already at initial state"));
    }
    const prev = executed[executed.length - 1].name;
    return umzug.down({ to: prev });
  });
}

const cmd = process.argv[2].trim();
let executedCmd;

switch (cmd) {
  case "status":
    executedCmd = cmdStatus();
    break;

  case "up":
  case "migrate":
    executedCmd = cmdMigrate();
    break;

  case "next":
  case "migrate-next":
    executedCmd = cmdMigrateNext();
    break;

  case "down":
  case "reset":
    executedCmd = cmdReset();
    break;

  case "prev":
  case "reset-prev":
    executedCmd = cmdResetPrev();
    break;

  case "reset-hard":
    executedCmd = cmdHardReset();
    break;

  default:
    process.exit(1);
}

executedCmd
  .then((result) => {
    const doneStr = `${cmd.toUpperCase()} DONE`;
    console.log(doneStr);
    console.log("=".repeat(doneStr.length));
  })
  .catch((err) => {
    const errorStr = `${cmd.toUpperCase()} ERROR`;
    console.log(errorStr);
    console.log("=".repeat(errorStr.length));
    console.log(err);
    console.log("=".repeat(errorStr.length));
  })
  .then(() => {
    if (cmd !== "status" && cmd !== "reset-hard") {
      return cmdStatus();
    }
    return Promise.resolve();
  })
  .then(() => {
    process.exit(0);
  });
