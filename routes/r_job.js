const express = require("express");
const router = express.Router();
const {
    post_job,
    put_job,
    delete_job,
    get_detail_job,
    get_all_job
} = require("../controllers/c_job"); 

router.post("/job", post_job);
router.put("/job/:id_job", put_job);
router.delete("/job/:id_job", delete_job);
router.get("/job/:id_job", get_detail_job);
router.get("/job", get_all_job);

module.exports = router;