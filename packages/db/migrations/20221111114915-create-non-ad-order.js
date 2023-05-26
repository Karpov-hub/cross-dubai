"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("non_ad_orders", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
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
      maker: {
        type: Sequelize.UUID
      },
      signobject: {
        type: Sequelize.JSONB
      },
      organisation: {
        type: Sequelize.UUID
      },
      order_type: {
        type: Sequelize.UUID
      },
      status: {
        type: Sequelize.INTEGER
      },
      no: {
        type: Sequelize.STRING
      },
      additional_data: {
        type: Sequelize.JSONB
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("non_ad_orders");
  }
};
