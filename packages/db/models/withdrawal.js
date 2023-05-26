"use strict";
module.exports = (sequelize, DataTypes) => {
  const withdrawal = sequelize.define(
    "withdrawal",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
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

  return withdrawal;
};
