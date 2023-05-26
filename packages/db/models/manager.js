"use strict";
module.exports = (sequelize, DataTypes) => {
  const manager = sequelize.define("manager", {
    id: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    admin_id: DataTypes.UUID,
    clients: DataTypes.JSONB
  });

  return manager;
};
