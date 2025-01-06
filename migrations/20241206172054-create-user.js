"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("User", {
      id_user: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        unique: true, // Pastikan email unik
      },
      password: {
        type: Sequelize.STRING,
      },
      role: {
        type: Sequelize.ENUM("Admin", "Pelamar Kerja"),
        defaultValue: "Pelamar Kerja",
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ttl: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      jenis_kelamin: {
        type: Sequelize.ENUM("L", "P"),
        defaultValue: "L",
        allowNull: true,
      },
      no_tlp: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      no_npwp: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      alamat_rumah: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      ijazah: {
        allowNull: true,
        type: Sequelize.STRING, // Atau TEXT jika dokumen lebih panjang
      },
      ktp: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      cv: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      token: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    }, {
      timestamps: false, // Menggunakan timestamps untuk createdAt dan updatedAt
    });
  },
  
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("User");
  },
};