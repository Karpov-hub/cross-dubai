"use strict";
module.exports = (sequelize, DataTypes) => {
  const contractor = sequelize.define(
    "contractor",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      country: DataTypes.STRING,
      name: DataTypes.STRING,
      reg_num: DataTypes.STRING,
      tax_id: DataTypes.STRING,
      vat: DataTypes.STRING,
      legal_address: DataTypes.STRING,
      office_address: DataTypes.STRING,
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      agreement_num: DataTypes.STRING,
      agreement_date: DataTypes.DATE,
      report_name: DataTypes.STRING,

      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE
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
  contractor.associate = function(models) {};
  return contractor;
};
