const express = require("express");
const router = express.Router();
const {
    post_blog,
    put_blog,
    delete_blog,
    get_detail_blog,
    get_all_blog,
} = require("../controllers/c_blog");

router.post("/blog", post_blog);
router.put("/blog/:id_blog", put_blog);
router.delete("/blog/:id_blog", delete_blog);
router.get("/blog/:id_blog", get_detail_blog);
router.get("/blog", get_all_blog);

module.exports = router;