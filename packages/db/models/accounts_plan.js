"use strict";
module.exports = (sequelize, DataTypes) => {
  const accounts_plan = sequelize.define(
    "accounts_plan",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      name: DataTypes.STRING(255),
      description: DataTypes.STRING(255),
      algo_amount: DataTypes.TEXT,
      method_amount: DataTypes.STRING(255),
      items: DataTypes.JSON,
      variables: DataTypes.JSON,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      removed: DataTypes.INTEGER,
      signobject: DataTypes.JSON,
      tags: DataTypes.JSONB
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );

  return accounts_plan;
};
