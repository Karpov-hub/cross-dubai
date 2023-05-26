"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("contractors", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      country: Sequelize.STRING(140),
      name: Sequelize.STRING,
      reg_num: Sequelize.STRING(20),
      tax_id: Sequelize.STRING(40),
      vat: Sequelize.STRING(15),
      legal_address: Sequelize.STRING,
      office_address: Sequelize.STRING,
      phone: Sequelize.STRING(20),
      email: Sequelize.STRING(50),
      agreement_num: Sequelize.STRING(30),
      agreement_date: Sequelize.DATE,
      report_name: Sequelize.STRING(30),

      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      removed: Sequelize.INTEGER,
      signobject: Sequelize.JSON
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("contractors");
  }
};
