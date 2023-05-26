"use strict";
module.exports = (sequelize, DataTypes) => {
  const realmaccount = sequelize.define(
    "realmaccount",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      realm_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "realm",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      account_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "account",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      iban_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "iban",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      type: DataTypes.TEXT,
      details: DataTypes.TEXT,
      country: DataTypes.STRING(3),
      callback: DataTypes.STRING(255),

      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      signobject: DataTypes.JSON,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  realmaccount.associate = function(models) {
    realmaccount.belongsTo(models.account, {
      foreignKey: "account_id",
      targetKey: "id"
    });
    realmaccount.belongsTo(models.iban, {
      foreignKey: "iban_id",
      targetKey: "id"
    });
  };
  return realmaccount;
};
