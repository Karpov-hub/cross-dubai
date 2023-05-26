"use strict";
module.exports = (sequelize, DataTypes) => {
  const transfer_log = sequelize.define(
    "transfer_log",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      transfer_id: {
        type: DataTypes.UUID
      },

      ctime: {
        type: DataTypes.DATE
      },
      code: {
        type: DataTypes.STRING(50)
      },
      message: {
        type: DataTypes.STRING(255)
      },
      data: {
        type: DataTypes.TEXT
      },
      request: {
        type: DataTypes.TEXT
      }
    },
    {
      createdAt: "ctime",
      updatedAt: false,
      deletedAt: false
    }
  );
  return transfer_log;
};
