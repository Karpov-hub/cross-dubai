"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("company_kycs", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      userId: {
        type: Sequelize.UUID
      },
      realmId: {
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING
      },
      registrar_name: {
        type: Sequelize.STRING
      },
      tax_number: {
        type: Sequelize.STRING
      },
      business_type: {
        type: Sequelize.STRING
      },
      registration_number: {
        type: Sequelize.STRING
      },
      registration_country: {
        type: Sequelize.STRING
      },
      registration_date: {
        type: Sequelize.DATE
      },
      years_in_business: {
        type: Sequelize.STRING
      },
      numbers_of_employees: {
        type: Sequelize.STRING
      },
      incorporation_form: {
        type: Sequelize.STRING
      },
      date_of_last_financial_activity_report: {
        type: Sequelize.DATE
      },
      use_trade_licence: {
        type: Sequelize.STRING
      },
      directors: {
        type: Sequelize.STRING
      },
      shareholders: {
        type: Sequelize.STRING
      },
      beneficial_owner: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      file: {
        type: Sequelize.UUID
      },
      verified: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    return queryInterface.dropTable("company_kycs");
  }
};
