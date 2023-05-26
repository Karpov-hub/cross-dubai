"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("tests", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING(50)
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      service: {
        type: Sequelize.STRING
      },
      method: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.JSON
      },
      result: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      ctime: {
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      },
      removed: {
        type: Sequelize.INTEGER
      },
      signobject: {
        type: Sequelize.JSON
      },
      maker: {
        type: Sequelize.UUID
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("tests");
  }
};
