'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Job', {
      id_job: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      job_requirement: {
        type: Sequelize.STRING
      },
      posisi: {
        type: Sequelize.STRING
      },
      job_deskripsi: {
        type: Sequelize.STRING
      },
      salary: {
        type: Sequelize.DOUBLE
      },
      job_type: {
        type: Sequelize.STRING
      },
      lokasi_penempatan: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Job');
  }
};