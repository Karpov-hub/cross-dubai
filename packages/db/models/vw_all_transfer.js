"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_all_transfer = sequelize.define(
    "vw_all_transfer",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },

      type: DataTypes.CHAR,
      step: DataTypes.INTEGER,
      ctime: DataTypes.DATE,
      invisibility_exp_date: DataTypes.DATE
    },
    {
      createdAt: "ctime",
      updatedAt: false,
      deletedAt: false
    }
  );

  return vw_all_transfer;
};
