"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("transactions", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      realm_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "realms",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      transfer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "transfers",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      tariff_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "tariffs",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      plan_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "tariffplans",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      held: Sequelize.BOOLEAN,
      amount: Sequelize.FLOAT,
      acc_src: Sequelize.STRING(50),
      acc_dst: Sequelize.STRING(50),
      tariff: Sequelize.STRING(100),
      plan: Sequelize.STRING(100),
      ref_id: Sequelize.STRING(50),
      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      signobject: Sequelize.JSON,
      removed: Sequelize.INTEGER
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("transactions");
  }
};
