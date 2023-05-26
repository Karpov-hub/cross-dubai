"use strict";
module.exports = (sequelize, DataTypes) => {
  const operation = sequelize.define(
    "operation",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      name: DataTypes.STRING,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      }
    },
    {
      createdAt: "ctime",
      updatedAt: false,
      deletedAt: false
    }
  );
  return operation;
};
