"use strict";
module.exports = (sequelize, DataTypes) => {
  const merchant_account = sequelize.define(
    "merchant_account",
    {
      id_merchant: {
        type: DataTypes.UUID,
        allowNull: true,
        foreignKey: true,
        primaryKey: true
      },
      id_account: {
        type: DataTypes.UUID,
        foreignKey: true
      },
      ctime: DataTypes.DATE
    },
    {
      createdAt: "ctime",
      updatedAt: false,
      deletedAt: false
    }
  );
  merchant_account.associate = function(models) {
    merchant_account.belongsTo(models.account, {
      foreignKey: "id_account",
      targetKey: "id"
    });
    merchant_account.belongsTo(models.merchant, {
      foreignKey: "id_merchant",
      targetKey: "id"
    });
  };
  return merchant_account;
};
