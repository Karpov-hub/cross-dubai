"use strict";
module.exports = (sequelize, DataTypes) => {
  const log = sequelize.define(
    "log",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      request: DataTypes.JSON,
      responce: DataTypes.JSON,
      realm: DataTypes.UUID,
      service: DataTypes.STRING,
      method: DataTypes.STRING,
      ctime: DataTypes.DATE,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      }
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false
    }
  );

  return log;
};
