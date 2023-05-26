"use strict";
module.exports = (sequelize, DataTypes) => {
  const currency_history = sequelize.define(
    "currency_history",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      realms: DataTypes.JSON,
      name: DataTypes.STRING(50),
      active: DataTypes.BOOLEAN,
      crypto: DataTypes.BOOLEAN,
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
      deletedAt: false,
      freezeTableName: true
    }
  );
  currency_history.associate = function(models) {
    // associations can be defined here
  };
  return currency_history;
};
