"use strict";
module.exports = (sequelize, DataTypes) => {
  const server = sequelize.define(
    "tariff",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        unique: true,
        primaryKey: true
      },
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      trigger: DataTypes.UUID,
      data: DataTypes.JSON,
      variables: DataTypes.JSON,
      actions: DataTypes.JSON,
      rules: DataTypes.JSON,
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
