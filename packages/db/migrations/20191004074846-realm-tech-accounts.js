"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("realmaccounts", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      realm_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "realms",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      account_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "accounts",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      type: Sequelize.INTEGER,
      details: Sequelize.TEXT,
      country: Sequelize.STRING(3),
      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      signobject: Sequelize.JSON,
      removed: Sequelize.INTEGER
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("realmaccounts");
  }
};
