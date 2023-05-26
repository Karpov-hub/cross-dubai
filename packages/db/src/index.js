import Sequelize from "sequelize";
import config from "config";

console.log("config:", config);

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
