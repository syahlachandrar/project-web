"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  
  User.init(
    {
      id_user: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      username: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true, // Pastikan email unik
      },
      password: DataTypes.STRING,
      nama: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM("Admin", "Pelamar Kerja"),
        defaultValue: "Pelamar Kerja",
        allowNull: true,
      },
      ttl: DataTypes.DATE,
      jenis_kelamin: {
        type: DataTypes.ENUM("L", "P"),
        allowNull: true,
      },
      no_tlp: DataTypes.STRING,
      no_npwp: DataTypes.STRING,
      alamat_rumah: DataTypes.STRING,
      ijazah: DataTypes.STRING, // Atau TEXT, jika dokumen mungkin lebih panjang
      ktp: DataTypes.STRING,
      cv: DataTypes.STRING,
      token: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "User",
      timestamps: true, // Aktifkan timestamps untuk createdAt dan updatedAt
      paranoid: false, // Mengaktifkan soft delete
    }
  );

  return User;
};