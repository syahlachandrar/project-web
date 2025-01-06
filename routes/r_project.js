const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
    post_project,
    put_project,
    delete_project,
    get_detail_project,
    get_all_project,
} = require("../controllers/c_project");

router.post("/project", post_project);
router.put("/project/:id_project", upload.single('foto'), put_project);
router.delete("/project/:id_project", delete_project);
router.get("/project/:id_project", get_detail_project);
router.get("/project", get_all_project);

module.exports = router;