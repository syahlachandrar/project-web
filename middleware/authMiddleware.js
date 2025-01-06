// const db = require("../models");
// const tbl_levels = db.tbl_levels;
// const tbl_user = db.tbl_user;
// const tbl_customer = db.tbl_customer;
// const jwt = require('jsonwebtoken');
// const { Op } = require('sequelize');

// const authenticate = async (req, res, next) => {
//     const authHeader = req.headers['authorization']; // Menggunakan lowercase 'authorization'
//     console.log('Authorization Header:', authHeader);

//     if (!authHeader) {
//         console.log('No token provided');
//         return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
//     }

//     const token = authHeader.split(' ')[1]; // Mengambil token setelah 'Bearer'
//     console.log('Token:', token); // Log token untuk verifikasi

//     if (!token) {
//         console.log('No token found after Bearer');
//         return res.status(401).json({ msg: "Token tidak valid!" });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         console.log('Decoded Token:', decoded); // Log isi token yang terdekode

//         // Cek apakah decoded token memiliki UUID
//         if (!decoded || !decoded.uuid) {
//             console.log('UUID not found in decoded token');
//             return res.status(400).json({ msg: "Token tidak valid!" });
//         }

//         const uuid = decoded.uuid;
//         console.log('Decoded UUID:', uuid); // Log UUID untuk verifikasi

//         const user = await tbl_customer.findOne({ where: { customer_uuid: uuid } });
//         const user_admin = await tbl_user.findOne({ where: { user_uuid: uuid } });

//         if (!user && !user_admin) {
//             console.log('User not found');
//             return res.status(404).json({ msg: "User tidak ditemukan" });
//         }

//         req.userUuid = uuid;
//         console.log('Set req.userUuid:', req.userUuid); // Log to confirm userUuid is set
//         next();
//     } catch (error) {
//         console.error('Token verification failed:', error);
//         return res.status(401).json({ msg: "Token tidak valid atau telah kadaluarsa" });
//     }
// };

// const Admin = async (req, res, next) => {
//     const uuid = req.userUuid;
//     try {
//         const leveladmin = await tbl_levels.findOne({ where: { level_name: 'admin' } });
//         const levelsuperadmin = await tbl_levels.findOne({ where: { level_name: 'super admin' } });

//         const user = await tbl_user.findOne({
//             where: {
//                 [Op.or]: [
//                     { user_level: leveladmin.dataValues.level_uuid },
//                     { user_level: levelsuperadmin.dataValues.level_uuid, user_uuid: uuid }
//                 ]
//             }
//         });

//         if (!user) {
//             return res.status(403).json({ msg: "Akses ditolak!" });
//         }

//         next();
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ msg: "Terjadi kesalahan pada server" });
//     }
// };

// const authToken = async (req, res, next) => {
//     const authHeader = req.headers['authorization']
//     const token = authHeader && authHeader.split(' ')[1]

//     if (!token) {
//         return res.status(401).json({
//             message: 'Token anda tidak ditemukan'
//         });
//     } else {
//         jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//             if (err) {
//                 return res.status(401).json({
//                     message: 'Token salah atau kadaluarsa'
//                 });
//             } else {
//                 req.user = {
//                     uuid: user.user_uuid,
//                     email: user.user_email,
//                     password: user.user_password
//                 };
//             }
//             console.log("USERRRRR", req.user)
//             next()
//         });
//     }
// };

// module.exports = { authenticate, Admin, authToken };