"use strict";
module.exports = (sequelize, DataTypes) => {
  const server = sequelize.define(
    "trigger",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      name: DataTypes.STRING,
      service: DataTypes.STRING,
      method: DataTypes.STRING,
      cron: DataTypes.STRING,
      ttype: DataTypes.INTEGER,
      tablename: DataTypes.STRING,
      conditions: DataTypes.STRING,
      data: DataTypes.JSON,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE
      },

      stime: DataTypes.BIGINT,
      ltime: DataTypes.BIGINT,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },

      signobject: DataTypes.JSON,
      maker: DataTypes.UUID
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  server.associate = function(models) {
    // associations can be defined here
  };
  return server;
};
