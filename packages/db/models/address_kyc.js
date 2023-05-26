"use strict";
module.exports = (sequelize, DataTypes) => {
  const address_kyc = sequelize.define(
    "address_kyc",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      realm_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "realm",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      country: {
        type: DataTypes.STRING
      },
      state: {
        type: DataTypes.STRING
      },
      city: {
        type: DataTypes.STRING
      },
      zip_code: {
        type: DataTypes.INTEGER
      },
      address_type: {
        type: DataTypes.STRING
      },
      doc_type: {
        type: DataTypes.STRING
      },
      issue_date: {
        type: DataTypes.DATE
      },
      file: {
        type: DataTypes.JSON
      },
      file_name: {
        type: DataTypes.JSON
      },
      file_size: {
        type: DataTypes.JSON
      },
      verified: {
        type: DataTypes.INTEGER
      },
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  address_kyc.associate = function(models) {
    // associations can be defined here
  };
  return address_kyc;
};
