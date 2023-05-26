"use strict";
module.exports = (sequelize, DataTypes) => {
  const settings = sequelize.define(
    "settings",
    {
      id: {
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      key: DataTypes.STRING,
      value: DataTypes.STRING,

      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      signobject: DataTypes.JSON,
      removed: DataTypes.INTEGER
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  return settings;
};
