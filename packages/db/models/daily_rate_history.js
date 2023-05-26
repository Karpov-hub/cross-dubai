"use strict";
module.exports = (sequelize, DataTypes) => {
  const average_daily_rate_history = sequelize.define(
    "daily_rate_history",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      currencies_pair: DataTypes.STRING,
      buy: DataTypes.DECIMAL,
      sell: DataTypes.DECIMAL,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE
      },
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
  average_daily_rate_history.associate = function(models) {
    // associations can be defined here
  };
  return average_daily_rate_history;
};
