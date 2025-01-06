const router = require("express").Router();

const r_auth = require("./r_auth");
const r_user = require("./r_user");
const r_job = require("./r_job");
const r_testimoni = require("./r_testimoni");
const r_tim = require("./r_tim");
const r_blog = require("./r_blog");
const r_layanan = require("./r_layanan");
const r_project = require("./r_project");
const r_appointment = require("./r_appointment");

router.use("/api/v6", r_auth);
router.use("/api/v6", r_user);
router.use("/api/v6", r_job);
router.use("/api/v6", r_testimoni);
router.use("/api/v6", r_tim);
router.use("/api/v6", r_appointment);
router.use("/api/v6", r_project);
router.use("/api/v6", r_layanan);
router.use("/api/v6", r_blog);

module.exports = router;