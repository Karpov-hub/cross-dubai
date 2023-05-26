"use strict";
module.exports = (sequelize, DataTypes) => {
  const account_crypto = sequelize.define(
    "account_crypto",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      acc_no: DataTypes.STRING(50),
      address: DataTypes.STRING(150),
      wallet: DataTypes.STRING(150),
      abbr: DataTypes.STRING(3),
      wallet_type: DataTypes.INTEGER
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false,
      freezeTableName: true,
      indexes: [
        {
          unique: true,
          fields: ["acc_no"]
        }
      ]
    }
  );

  account_crypto.associate = function(models) {
    account_crypto.belongsTo(models.account, {
      foreignKey: "acc_no",
      targetKey: "acc_no"
    });
  };
  return account_crypto;
};
