"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("transfers", {
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
      event_name: Sequelize.STRING(50),
      held: Sequelize.BOOLEAN,
      description: Sequelize.STRING(255),
      notes: Sequelize.STRING(255),
      data: Sequelize.JSON,
      amount: Sequelize.FLOAT,
      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      signobject: Sequelize.JSON,
      removed: Sequelize.INTEGER
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("transfers");
  }
};
