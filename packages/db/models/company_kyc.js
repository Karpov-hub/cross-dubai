"use strict";
module.exports = (sequelize, DataTypes) => {
  const company_kyc = sequelize.define(
    "company_kyc",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      realm_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "realms",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      name: {
        type: DataTypes.STRING
      },
      registrar_name: {
        type: DataTypes.STRING
      },
      tax_number: {
        type: DataTypes.STRING
      },
      business_type: {
        type: DataTypes.STRING
      },
      registration_number: {
        type: DataTypes.STRING
      },
      registration_country: {
        type: DataTypes.STRING
      },
      registration_date: {
        type: DataTypes.DATE
      },
      years_in_business: {
        type: DataTypes.INTEGER
      },
      numbers_of_employees: {
        type: DataTypes.STRING
      },
      incorporation_form: {
        type: DataTypes.STRING
      },
      date_of_last_financial_activity_report: {
        type: DataTypes.DATE
      },
      use_trade_licence: {
        type: DataTypes.STRING
      },
      directors: {
        type: DataTypes.STRING
      },
      shareholders: {
        type: DataTypes.STRING
      },
      beneficial_owner: {
        type: DataTypes.STRING
      },
      phone: {
        type: DataTypes.STRING
      },
      file: {
        type: DataTypes.JSON
      },
      file_name: {
        type: DataTypes.JSON
      },
      file_size: {
        type: DataTypes.JSON
      },
      verified: {
        type: DataTypes.INTEGER
      },
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  company_kyc.associate = function(models) {
    // associations can be defined here
  };
  return company_kyc;
};
