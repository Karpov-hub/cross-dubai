"use strict";
module.exports = (sequelize, DataTypes) => {
  const transaction = sequelize.define(
    "transaction",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      realm_id: {
        type: DataTypes.UUID,
        allowNull: true,
        foreignKey: true,
        references: {
          model: "realm",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        foreignKey: true,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      transfer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        foreignKey: true,
        references: {
          model: "transfer",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      tariff_id: {
        type: DataTypes.UUID,
        allowNull: true,
        foreignKey: true,
        references: {
          model: "tariff",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      plan_id: {
        type: DataTypes.UUID,
        allowNull: true,
        foreignKey: true,
        references: {
          model: "tariffsplan",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      txtype: DataTypes.STRING(15),
      index: DataTypes.INTEGER,
      held: DataTypes.BOOLEAN,
      hidden: DataTypes.BOOLEAN,
      canceled: DataTypes.BOOLEAN,
      amount: DataTypes.FLOAT,
      exchange_amount: DataTypes.FLOAT,
      acc_src: DataTypes.STRING(50),
      acc_dst: DataTypes.STRING(50),
      tariff: DataTypes.STRING(100),
      plan: DataTypes.STRING(100),
      ref_id: DataTypes.STRING(50),
      description_src: DataTypes.STRING(255),
      description_dst: DataTypes.STRING(255),
      currency_src: DataTypes.STRING(3),
      currency_dst: DataTypes.STRING(3),

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
      deletedAt: false,
      hooks: {
        afterFind: function(result) {
          if (result.constructor === Array) {
            for (var i = 0; i < result.length; i++) {
              result[i].amount = parseFloat(result[i].amount);
              result[i].exchange_amount = parseFloat(result[i].exchange_amount);
            }
          } else {
            result.amount = parseFloat(result.amount);
            result.exchange_amount = parseFloat(result.exchange_amount);
          }
          return result;
        },
        afterCreate: (result) => {
          result.amount = parseFloat(result.amount);
          result.exchange_amount = parseFloat(result.exchange_amount);
          return result;
        }
      }
    }
  );

  transaction.associate = function(models) {
    transaction.belongsTo(models.transfer, {
      foreignKey: "transfer_id",
      targetKey: "id"
    });
    transaction.belongsTo(models.cryptotx, {
      foreignKey: "transfer_id",
      targetKey: "transfer_id"
    });
  };

  return transaction;
};
