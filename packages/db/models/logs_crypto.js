"use strict";
module.exports = (sequelize, DataTypes) => {
  const logs_crypto = sequelize.define(
    "logs_crypto",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      url: DataTypes.STRING(100),
      action: DataTypes.STRING(80),
      data: DataTypes.TEXT,
      response: DataTypes.TEXT,
      ctime: DataTypes.DATE
    },
    {
      createdAt: "ctime",
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  logs_crypto.associate = function(models) {
    // associations can be defined here
  };
  return logs_crypto;
};
