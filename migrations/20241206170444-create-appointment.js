'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Appointment', {
      id_appointment: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_klien: {
        type: Sequelize.STRING
      },
      jasa: {
        type: Sequelize.STRING
      },
      email_klien: {
        type: Sequelize.STRING
      },
      no_tlpn_klien: {
        type: Sequelize.STRING
      },
      pesan: {
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
    await queryInterface.dropTable('Appointment');
  }
};