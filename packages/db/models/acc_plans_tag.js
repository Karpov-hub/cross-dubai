"use strict";
module.exports = (sequelize, DataTypes) => {
  const acc_plans_tag = sequelize.define(
    "acc_plans_tag",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      name: DataTypes.STRING(255),
      description: DataTypes.STRING(255),
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      removed: DataTypes.INTEGER,
      signobject: DataTypes.JSON
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );

  return acc_plans_tag;
};
