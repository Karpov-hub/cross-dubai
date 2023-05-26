"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_accounts_with_gas = sequelize.define(
    "vw_accounts_with_gas",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      owner_id: DataTypes.UUIDV4,
      wallet_id: DataTypes.UUIDV4,
      merchant_id: DataTypes.UUIDV4,
      acc_no: DataTypes.STRING,
      currency: DataTypes.STRING,
      balance: DataTypes.FLOAT,
      address: DataTypes.STRING,
      gas_acc_no: DataTypes.STRING,
      gas_currency: DataTypes.STRING,
      gas_acc_id: DataTypes.UUIDV4,
      status: DataTypes.INTEGER,
      telegram_link: DataTypes.STRING,
      ctime: DataTypes.DATE,
      wallet_type: DataTypes.INTEGER
    },
    {
      createdAt: "ctime",
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );

  return vw_accounts_with_gas;
};
