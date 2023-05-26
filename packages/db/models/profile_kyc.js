"use strict";
module.exports = (sequelize, DataTypes) => {
  const profile_kyc = sequelize.define(
    "profile_kyc",
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
      doc_type: {
        type: DataTypes.STRING
      },
      first_name: {
        type: DataTypes.STRING
      },
      middle_name: {
        type: DataTypes.STRING
      },
      last_name: {
        type: DataTypes.STRING
      },
      issue_date: {
        type: DataTypes.DATE
      },
      doc_num: {
        type: DataTypes.STRING
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
  profile_kyc.associate = function(models) {
    // associations can be defined here
  };
  return profile_kyc;
};
