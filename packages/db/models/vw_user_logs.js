"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_user_logs = sequelize.define(
    "vw_user_logs",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      data: DataTypes.JSON,
      result: DataTypes.JSON,
      date: DataTypes.DATE,
      merchant: DataTypes.STRING,
      method: DataTypes.STRING,
      username: DataTypes.STRING,
      admin_name: DataTypes.STRING
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false
    }
  );

  return vw_user_logs;
};
