"use strict";
module.exports = (sequelize, DataTypes) => {
  const nil_log = sequelize.define(
    "nil_log",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      request: DataTypes.TEXT,
      response: DataTypes.TEXT,
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

  return nil_log;
};
