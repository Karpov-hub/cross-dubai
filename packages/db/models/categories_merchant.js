"use strict";
module.exports = (sequelize, DataTypes) => {
  const categories_merchant = sequelize.define(
    "categories_merchant",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      code: DataTypes.STRING(10),
      name: DataTypes.STRING,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      signobject: DataTypes.JSON,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      maker: DataTypes.UUID
    },
    {
      id: "_id",
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  categories_merchant.associate = function(models) {
    // associations can be defined here
  };
  return categories_merchant;
};
