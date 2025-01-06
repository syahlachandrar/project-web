const express = require("express");
const router = express.Router();
const { registrasi, login, logOut } = require("../controllers/c_auth"); // Sesuaikan dengan path yang benar

// Menambahkan rute untuk registrasi dan login
router.post("/registrasi", registrasi);
router.post("/login", login);
router.delete("/logout", logOut);

// Tambahkan rute lain sesuai kebutuhan

module.exports = router; // Pastikan router diekspor dengan benar