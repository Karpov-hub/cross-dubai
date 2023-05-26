"use strict";
module.exports = (sequelize, DataTypes) => {
  const non_ad_order = sequelize.define(
    "non_ad_order",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      removed: DataTypes.INTEGER,
      maker: DataTypes.UUID,
      signobject: DataTypes.JSONB,
      organisation: DataTypes.UUID,
      order_type: DataTypes.STRING,
      status: DataTypes.INTEGER,
      no: DataTypes.STRING,
      additional_data: DataTypes.JSONB,
      has_transfers: DataTypes.BOOLEAN,
      short_id: DataTypes.STRING(15)
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  non_ad_order.associate = function(models) {
    // associations can be defined here
  };
  return non_ad_order;
};
