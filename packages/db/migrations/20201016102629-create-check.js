"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("checks", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID
      },
      test_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "tests",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      code: {
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
      maker: {
        type: Sequelize.UUID
      },
      signobject: {
        type: Sequelize.JSON
      },
      removed: {
        type: Sequelize.INTEGER
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("checks");
  }
};
