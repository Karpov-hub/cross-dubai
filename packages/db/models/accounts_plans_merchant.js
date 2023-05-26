"use strict";
module.exports = (sequelize, DataTypes) => {
  const accounts_plans_merchant = sequelize.define(
    "accounts_plans_merchant",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      plan_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "accounts_pan",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      merchant_id: DataTypes.UUID,
      name: DataTypes.STRING(255),
      make_accounts: DataTypes.BOOLEAN,
      items: DataTypes.JSON,

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

  return accounts_plans_merchant;
};
