"use strict";
module.exports = (sequelize, DataTypes) => {
  const cryptotx = sequelize.define(
    "cryptotx",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING(255)
      },
      transfer_id: {
        type: DataTypes.UUID
      },
      currency_id: {
        type: DataTypes.STRING(3)
      },
      address: {
        type: DataTypes.STRING(255)
      },
      amount: {
        type: DataTypes.FLOAT
      },
      tag: {
        type: DataTypes.STRING(40)
      },
      confirmations: {
        type: DataTypes.INTEGER
      },
      tx_status: {
        type: DataTypes.STRING(20)
      },
      sign: {
        type: DataTypes.STRING
      },
      network_fee: {
        type: DataTypes.FLOAT
      },
      network_fee_currency_id: {
        type: DataTypes.STRING(4)
      },
      crypto_bot: {
        type: DataTypes.STRING(100)
      },
      ctime: {
        type: DataTypes.DATE
      },
      mtime: {
        type: DataTypes.DATE
      },
      provided: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false,
      freezeTableName: true
    }
  );
  cryptotx.associate = function(models) {
    // associations can be defined here
  };
  return cryptotx;
};
