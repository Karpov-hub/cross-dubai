"use strict";
module.exports = (sequelize, DataTypes) => {
  const payments_queue = sequelize.define(
    "payments_queue",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      ctime: {
        type: DataTypes.DATE
      },
      data: {
        type: DataTypes.JSON
      }
    },
    {
      createdAt: "ctime",
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  payments_queue.associate = function(models) {
    // associations can be defined here
  };
  return payments_queue;
};
