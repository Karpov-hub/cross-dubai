"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_transfer = sequelize.define(
    "vw_transfer",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      realm_id: DataTypes.UUID,
      user_id: DataTypes.UUID,
      maker: DataTypes.UUID,
      order_id: DataTypes.UUID,
      plan_transfer_id: DataTypes.UUID,

      event_name: DataTypes.STRING(50),
      ref_id: DataTypes.STRING(50),
      description: DataTypes.STRING,
      notes: DataTypes.STRING,
      realmname: DataTypes.STRING,
      organisation_name: DataTypes.STRING,
      legalname: DataTypes.STRING(150),
      username: DataTypes.STRING,
      currency: DataTypes.STRING,
      merchant_id: DataTypes.STRING,
      string_status: DataTypes.STRING,

      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      invisibility_exp_date: DataTypes.DATE,

      amount: DataTypes.FLOAT,

      status: DataTypes.INTEGER,
      user_type: DataTypes.INTEGER,
      removed: DataTypes.INTEGER,

      held: DataTypes.BOOLEAN,
      canceled: DataTypes.BOOLEAN,
      show_to_client: DataTypes.BOOLEAN,
      tf_by_plan_description: DataTypes.JSONB,

      data: DataTypes.JSON,
      signobject: DataTypes.JSON
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );

  vw_transfer.associate = function(models) {};

  return vw_transfer;
};
