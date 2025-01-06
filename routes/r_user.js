const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadPDF");
const {
  post_user,
  put_user,
  delete_user,
  get_detail_user,
  get_all_user,
  get_count_user,
} = require("../controllers/c_user");

router.post("/user", post_user);
router.put(
  "/user/:id_user",
  upload.fields([
    { name: "ijazah", maxCount: 1 },
    { name: "ktp", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ]),
  put_user
);
router.delete("/user/:id_user", delete_user);
router.get("/user", get_all_user);
router.get("/user/:id_user", get_detail_user);
router.get("/user/count", get_count_user);

module.exports = router; // Pastikan router diekspor dengan benar
