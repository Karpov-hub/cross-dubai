"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("campaigns", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      external_id: {
        type: Sequelize.STRING
      },
      caption: {
        type: Sequelize.STRING
      },
      merchant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "merchants",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      signobject: {
        type: Sequelize.JSON
      },
      ltime: {
        type: Sequelize.BIGINT
      },
      stime: {
        type: Sequelize.BIGINT
      },
      removed: {
        type: Sequelize.INTEGER
      },
      maker: {
        type: Sequelize.UUID
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("campaigns");
  }
};
