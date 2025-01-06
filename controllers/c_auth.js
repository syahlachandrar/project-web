const db = require("../models");
const user = db.User;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const { Op } = require("sequelize");
const saltRounds = 10;

const userSchema = Joi.object({
  username: Joi.string()
    .required(),
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$"))
    .messages({
      "string.empty": "Password tidak boleh kosong",
      "string.pattern.base":
        "Password harus terdiri dari huruf besar, huruf kecil, dan angka, dan minimal 8 karakter",
    }),
  no_tlp: Joi.string()
    .required()
    .pattern(/^[0-9]{10,14}$/)
    .messages({
      "string.empty": "Nomor HP tidak boleh kosong",
      "string.pattern.base":
        "Nomor HP harus terdiri dari angka saja dan memiliki panjang minimal 10 dan maksimal 14",
    }),
});

const registrasi = async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { username, email, password, no_tlp } = value;

    const existingUser = await user.findOne({
      where: {
        [Op.and]: [{ email: email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan, silakan gunakan email lain.",
        data: existingUser,
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const create_user = await user.create({
      username: username,
      email: email,
      no_tlp: no_tlp,
      password: hashedPassword,
    });

    if (!create_user) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data pelanggan",
        data: null,
      });
    }

    // const create_media = await tbl_media.create({
    //   media_uuid_table: create_user.uuid,
    //   media_table: "customer",
    // });

    // if (!create_media) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Anda Gagal melakukan registrasi",
    //     data: null,
    //   });
    // }

    res.status(200).json({
      success: true,
      message: "Registrasi Berhasil",
      data: {
        username: create_user.username,
        email: create_user.email,
        no_tlp: create_user.no_tlp,
        password: create_user.password,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const login = async (req, res) => {
  let username;
  let email;
  let token;
  let password;

  try {
    const admin = await user.findOne({
      where: {
        email: req.body.email,
      },
    });

    const Pelamar_Kerja = await user.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!admin && !Pelamar_Kerja) {
      return res.status(404).json({ msg: "Akun Anda tidak terdaftar!" });
    }

    if (admin) {
      const match = await bcrypt.compare(req.body.password, admin.password);
      if (!match) {
        return res.status(400).json({ msg: "Password User Anda salah" });
      }
      username = admin.username;
      email = admin.email;
      password = admin.password;
    }

    if (Pelamar_Kerja) {
      const match = await bcrypt.compare(
        req.body.password,
        Pelamar_Kerja.password
      );
      if (!match) {
        return res.status(400).json({ msg: "Password User Anda salah" });
      }
      username = Pelamar_Kerja.username;
      email = Pelamar_Kerja.email;
      password = Pelamar_Kerja.password;

      // Membuat token
      token = jwt.sign(
        {
          email,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE_IN }
      );
      // Menyimpan token ke dalam kolom user_token di database
      await user.update(
        { token: token },
        { where: { email: email } }
      );
    }
    // Menghasilkan token untuk pengguna yang berhasil login (misal: superadmin, karyawandapur, karyawankasir)
    token = jwt.sign(
      {
        email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE_IN }
    );

    // Set cookie
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ username, email, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

const logOut = async (req, res) => {
  try {
    // Ambil token dari body atau query parameter
    const token = req.body.token || req.query.token;

    // Pastikan token dikirim
    if (!token) {
      return res.status(400).json({ msg: "Token tidak ada" });
    }

    // Temukan pengguna terkait dengan token yang diterima
    const foundUser = await user.findOne({ where: { token: token } }); // Ganti 'user' menjadi 'foundUser'

    // Jika pengguna ditemukan, hapus token dari database
    if (foundUser) {
      await user.update({ token: null }, { where: { id_user: foundUser.id_user } });
      return res.status(200).json({ msg: "Anda telah berhasil logout" });
    } else {
      return res.status(400).json({ msg: "Token tidak valid atau pengguna tidak ditemukan" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};
// const Me = async (req, res) => {};

module.exports = {
  registrasi,
  login,
  logOut,
  // Me,
};
