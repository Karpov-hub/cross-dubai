"use strict";
module.exports = (sequelize, DataTypes) => {
  const account_contract = sequelize.define(
    "account_contract",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        unique: true,
        primaryKey: true
      },
      account_number: DataTypes.STRING,
      bank: DataTypes.STRING,
      swift: DataTypes.STRING,
      correspondent_currency: DataTypes.STRING,
      correspondent_account: DataTypes.STRING,
      user_id: DataTypes.UUID,
      owner_id: DataTypes.UUID,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      signobject: DataTypes.JSON,
      currency: DataTypes.STRING
    },
    { createdAt: "ctime", updatedAt: false, deletedAt: false }
  );
  account_contract.associate = function(models) {
    // associations can be defined here
  };
  return account_contract;
};
