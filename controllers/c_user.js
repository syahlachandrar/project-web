const db = require("../models");
const user = db.User;
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { Op } = require("sequelize");
const Joi = require("joi");
const fs = require("fs");
const upload = require("../middleware/upload");
const path = require("path");

const userSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({ "string.empty": "username tidak boleh kosong" }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email tidak boleh kosong",
  }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password tidak boleh kosong",
  }),
});

const updateuserSchema = Joi.object({
  username: Joi.string().optional().messages({
    "string.empty": "Username tidak boleh kosong",
  }),

  nama: Joi.string().optional().messages({
    "string.empty": "Nama tidak boleh kosong",
  }),

  ttl: Joi.date().optional().messages({
    "string.empty": "tempat tanggal lahir tidak boleh kosong",
  }),

  email: Joi.string().email().optional().messages({
    "string.empty": "email tidak boleh kosong",
  }),

  nama: Joi.string().optional().messages({
    "string.empty": "nama tidak boleh kosong",
  }),

  jenis_kelamin: Joi.valid("L", "p").optional().messages({
    "string.empty": "Jenis kelamin tidak boleh kosong",
  }),

  no_tlp: Joi.string().optional().messages({
    "string.empty": "Nomor telefon tidak boleh kosong",
  }),

  no_npwp: Joi.string().optional().messages({
    "string.empty": "Nomor npwp tidak boleh kosong",
  }),

  alamat_rumah: Joi.string().optional().messages({
    "string.empty": "Alamat tidak boleh kosong",
  }),
});

const idSchema = Joi.object({
  id_user: Joi.number().integer().required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    username: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const querySchemaUniqe = Joi.object({
  field: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9,_]+$")),
});

const querySchemaCount = Joi.object({
  field: Joi.object()
    .pattern(
      Joi.string(),  // Kunci harus berupa string
      Joi.alternatives().try(
        Joi.number().integer(),
        Joi.string().trim(),  // Nilai bisa berupa string
        Joi.array().items(Joi.string().trim())  // Atau array dari string
      )
    )
    .required(), // Field ini wajib ada
});
const post_user = async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { username, email, password, role } = value;

    // Cek apakah email sudah ada di database
    const existingUser = await user.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: username }],
      },
    });

    // Jika email sudah ada, kirim respons error
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Email atau nomor HP sudah digunakan, silakan gunakan yang lain.",
        data: null,
      });
    }

    // Lanjutkan proses jika email belum ada
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const create_user = await user.create({
      username: username,
      email: email,
      password: hashedPassword,
      role: role,
    });

    if (!create_user) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data user",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data user",
      data: {
        username: create_user.username,
        email: create_user.email,
        role: create_user.role,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_user = async (req, res) => {
  try {
    const id_user = req.params.id_user;

    // Validasi input JSON menggunakan schema
    const { error, value } = updateuserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // Cari pengguna yang ingin diupdate
    const update_user = await user.findOne({
      where: { id_user },
    });

    if (!update_user) {
      return res.status(404).json({
        success: false,
        message: "Pelanggan tidak ditemukan",
        data: null,
      });
    }

    // Validasi dan upload file jika ada
    const files = req.files;
    if (files) {
      if (files.ijazah) {
        if (files.ijazah[0].mimetype !== "application/pdf") {
          return res.status(400).json({
            success: false,
            message: "File ijazah harus berupa PDF",
            data: null,
          });
        }
        if (update_user.ijazah) fs.unlinkSync(update_user.ijazah); // Hapus file lama
        value.ijazah = files.ijazah[0].path;
      }
      if (files.ktp) {
        if (files.ktp[0].mimetype !== "application/pdf") {
          return res.status(400).json({
            success: false,
            message: "File KTP harus berupa PDF",
            data: null,
          });
        }
        if (update_user.ktp) fs.unlinkSync(update_user.ktp); // Hapus file lama
        value.ktp = files.ktp[0].path;
      }
      if (files.cv) {
        if (files.cv[0].mimetype !== "application/pdf") {
          return res.status(400).json({
            success: false,
            message: "File CV harus berupa PDF",
            data: null,
          });
        }
        if (update_user.cv) fs.unlinkSync(update_user.cv); // Hapus file lama
        value.cv = files.cv[0].path;
      }
    }

    // Update data pengguna
    const hashedPassword = value.password
      ? await bcrypt.hash(value.password, saltRounds)
      : update_user.password;

    await update_user.update({
      username: value.username || update_user.username,
      nama: value.nama || update_user.nama,
      email: value.email || update_user.email,
      ttl: value.ttl || update_user.ttl,
      jenis_kelamin: value.jenis_kelamin || update_user.jenis_kelamin,
      no_tlp: value.no_tlp || update_user.no_tlp,
      no_npwp: value.no_npwp || update_user.no_npwp,
      alamat_rumah: value.alamat_rumah || update_user.alamat_rumah,
      ijazah: value.ijazah || update_user.ijazah,
      ktp: value.ktp || update_user.ktp,
      cv: value.cv || update_user.cv,
      password: hashedPassword,
      updateAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        username: update_user.username,
        nama: update_user.nama,
        email: update_user.email,
        ttl: update_user.ttl,
        jenis_kelamin: update_user.jenis_kelamin,
        no_tlp: update_user.no_tlp,
        no_npwp: update_user.no_npwp,
        alamat_rumah: update_user.alamat_rumah,
        ijazah: update_user.ijazah,
        ktp: update_user.ktp,
        cv: update_user.cv,
        createdAt: update_user.createdAt,
        updateAt: update_user.updateAt,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const delete_user = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_user } = value;

    const delete_user = await user.findOne({
      where: { id_user },
    });

    if (!delete_user) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data pelanggan",
        data: null,
      });
    }

    // Menghapus user secara permanen
    await user.destroy({
      where: { id_user },
    });

    //   await tbl_media.update(
    //     { media_delete_at: new Date() },
    //     { where: { media_uuid_table: id_user, media_table: "user" } }
    //   );

    res.json({
      success: true,
      message: "Sukses menghapus data pelanggan dan data media terkait",
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_detail_user = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_user } = value;

    const detail_user = await user.findOne({
      where: {
        id_user,
      },
    });

    if (!detail_user) {
      return res.status(404).json({
        success: false,
        message: "Gagal Mendapatkan Data",
        data: null,
      });
    }

    const result = {
      success: true,
      message: "Berhasil Mendapatkan Data",
      data: {
        username: detail_user.username,
        nama: detail_user.nama,
        email: detail_user.email,
        role: detail_user.role,
        ttl: detail_user.ttl,
        jenis_kelamin: detail_user.jenis_kelamin,
        no_tlp: detail_user.no_tlp,
        no_npwp: detail_user.no_npwp,
        alamat_rumah: detail_user.alamat_rumah,
      },
    };

    res.status(200).json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_all_user = async (req, res) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { id_user: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {

    };

    if (filter.username) {
      const filterNames = Array.isArray(filter.username)
        ? filter.username
        : filter.username.split(",");

      if (filterNames.length > 0) {
        whereClause.username = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.user_name");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.like]: `%${keyword}%`,
      };
      offset = 0;

      whereClause.username = whereClause.username
        ? { [Sequelize.Op.and]: [whereClause.username, keywordClause] }
        : keywordClause;
    }

    const data = await user.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((user) => ({
        username: user.username,
        email: user.email,
        role: user.role,
        ttl: user.ttl,
        jenis_kelamin: user.jenis_kelamin,
        no_tlp: user.no_tlp,
        no_npwp: user.no_npwp,
        alamat_rumah: user.alamat_rumah,
      })),
      pages: {
        total: data.count,
        per_page: limit || data.count,
        next_page: limit && page ? (page < totalPages ? page + 1 : null) : null,
        to: limit ? offset + data.rows.length : data.count,
        last_page: totalPages,
        current_page: page || 1,
        from: offset,
      },
    };

    if (data.count === 0) {
      return res.status(200).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
        pages: {
          total: 0,
          per_page: limit || 0,
          next_page: null,
          to: 0,
          last_page: 0,
          current_page: page || 1,
          from: 0,
        },
      });
    }

    const currentUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const excludePagesUrl = "http://localhost:5000/api/v6/user/get_all";

    if (currentUrl === excludePagesUrl) {
      delete result.pages;
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_count_user = async (req, res) => {
  try {
    const { error, value } = querySchemaCount.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { field } = value;

    const counts = {};

    for (const fieldName in field) {
      if (field.hasOwnProperty(fieldName)) {
        const values = Array.isArray(field[fieldName])
          ? field[fieldName]
          : field[fieldName].split(",").map((val) => val.trim());

        const valueCounts = {};

        for (const value of values) {
          const count = await user.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              user_delete_at: null,
            },
          });
          valueCounts[value] = count;
        }

        counts[fieldName] = Object.keys(valueCounts).map((value) => ({
          value,
          count: valueCounts[value],
        }));
      }
    }

    const response = {
      success: true,
      message: "Sukses mendapatkan data",
      data: counts,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = {
  post_user,
  put_user,
  delete_user,
  get_detail_user,
  get_all_user,
  get_count_user
};
