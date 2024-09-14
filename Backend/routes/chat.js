const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();

router.post("/showchats",fetchUser,(req,res)=>{
    return res.send("ya good");
})

module.exports = router;