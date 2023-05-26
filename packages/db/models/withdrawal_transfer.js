"use strict";
module.exports = (sequelize, DataTypes) => {
  const withdrawal_transfer = sequelize.define(
    "withdrawal_transfer",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      withdrawal_id: {
        type: DataTypes.UUID
      },
      transfer_id: {
        type: DataTypes.UUID
      },
      ctime: {
        type: DataTypes.DATE
      },
      mtime: {
        type: DataTypes.DATE
      },
      currency: {
        type: DataTypes.STRING(4)
      },
      amount: {
        type: DataTypes.DECIMAL(40, 18)
      },
      status: {
        type: DataTypes.INTEGER
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );

  return withdrawal_transfer;
};
