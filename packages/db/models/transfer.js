"use strict";
module.exports = (sequelize, DataTypes) => {
  const transfer = sequelize.define(
    "transfer",
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
      plan_transfer_id: DataTypes.UUID,
      invoice_number: DataTypes.STRING(50),
      ref_id: DataTypes.STRING(50),
      event_name: DataTypes.STRING(50),
      held: DataTypes.BOOLEAN,
      canceled: DataTypes.BOOLEAN,
      description: DataTypes.STRING(255),
      notes: DataTypes.STRING(255),
      data: DataTypes.JSON,
      amount: DataTypes.FLOAT,
      status: DataTypes.INTEGER,
      deferred: DataTypes.BOOLEAN,
      show_to_client: DataTypes.BOOLEAN,
      invisibility_exp_date: DataTypes.DATE,
      is_chain: DataTypes.BOOLEAN,

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
        afterFind: (result) => {
          if (!result) return result;
          if (result.constructor === Array) {
            for (var i = 0; i < result.length; i++) {
              result[i].amount = parseFloat(result[i].amount);
            }
          } else {
            result.amount = parseFloat(result.amount);
          }
          return result;
        },
        afterCreate: (result) => {
          result.amount = parseFloat(result.amount);
          return result;
        }
      }
    }
  );

  transfer.associate = function(models) {
    transfer.belongsTo(models.transaction, {
      foreignKey: "id",
      targetKey: "transfer_id"
    });
  };
  transfer.adminModelName = "Crm.modules.transfers.model.TransfersModel";
  return transfer;
};
