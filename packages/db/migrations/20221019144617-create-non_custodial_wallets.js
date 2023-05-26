"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("non_custodial_wallets", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      address: {
        type: Sequelize.STRING(130)
      },
      currency: {
        type: Sequelize.STRING(6)
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      memo: {
        type: Sequelize.STRING
      },
      last_pk_share_date: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      removed: {
        type: Sequelize.INTEGER
      },
      signobject: {
        type: Sequelize.JSON
      },
      maker: {
        type: Sequelize.UUID
      },
      ctime: {
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("non_custodial_wallets");
  }
};
