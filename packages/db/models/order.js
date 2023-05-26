"use strict";
module.exports = (sequelize, DataTypes) => {
  const order = sequelize.define(
    "order",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      merchant: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      organisation: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "merchant",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      realm_department: {
        type: DataTypes.UUID,
        // references: {
        //   model: "realmdepartment",
        //   key: "id"
        // },
        // onUpdate: "cascade",
        // onDelete: "cascade"
      },
      amount: DataTypes.DECIMAL,
      currency: DataTypes.STRING(4),
      res_currency: DataTypes.STRING(4),
      details: DataTypes.STRING,
      status: DataTypes.INTEGER,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      contract_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "contract",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      order_num: DataTypes.STRING(50),
      receiver_account: DataTypes.UUID,
      date_from: DataTypes.DATE,
      date_to: DataTypes.DATE,
      bank_details: DataTypes.TEXT,
      order_date: DataTypes.DATE,
      merchant_website: DataTypes.TEXT,
      merchant_owebsites: DataTypes.TEXT,
      amount2: DataTypes.DECIMAL,
      currency2: DataTypes.STRING(10)
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false,
      hooks: {
        afterFind: function(result) {
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
  order.associate = function(models) {
    // order.belongsTo(models.realmdepartment, {
    //   foreignKey: "realm_department",
    //   targetKey: "id"
    // });
    order.belongsTo(models.user, {
      foreignKey: "merchant",
      targetKey: "id"
    });
    order.belongsTo(models.merchant, {
      foreignKey: "organisation",
      as: "merchantAlias",
      targetKey: "id"
    });
    order.belongsTo(models.order_invoice, {
      foreignKey: "id",
      targetKey: "order_id"
    });
  };
  return order;
};
