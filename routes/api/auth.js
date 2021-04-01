const express = require("express")
const router = express.Router()
const auth = require("../../middleware/auth")

const User = require("../../models/Users")

// @route    GET api/auth
// @desc     Test route
// @acess    Public  
router.get("/", auth, async (req,res) => {

    try{
        const user = await User.findById(req.user.id).select("-password")
        res.json(user)

    }catch(err){

        console.log(err)
        res.status(500).json("Server Error")


    }


})

module.exports = router