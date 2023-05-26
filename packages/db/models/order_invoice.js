"use strict";
module.exports = (sequelize, DataTypes) => {
  const order_invoice = sequelize.define(
    "order_invoice",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      code: DataTypes.STRING,
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "order",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      generation_date: DataTypes.DATE
    },
    { createdAt: false, updatedAt: false, deletedAt: false }
  );
  order_invoice.associate = function(models) {
    order_invoice.belongsTo(models.order, {
      foreignKey: "order_id",
      targetKey: "id"
    });
  };
  return order_invoice;
};
