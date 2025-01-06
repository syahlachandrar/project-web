'use strict';
const bcrypt = require('bcrypt');
const saltRounds = 10;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('12345678', saltRounds);
    return queryInterface.bulkInsert('User', [
      {
        username: 'adminuser',
        email: 'adminuser@gmail.com',
        password: hashedPassword,
        role: 'admin'
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('User', null, {});
  },
};