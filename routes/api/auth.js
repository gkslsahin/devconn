const express = require("express")
const router = express.Router()
const config = require("config")
const User = require("../../models/Users")
const auth = require("../../middleware/auth")

const { check, validationResult } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")

// @route    POST api/auth
// @desc     Test route
// @acess    Public  
router.post("/",
[    
    check('email', 'Please include a valid email').isEmail(),
    check('password','Password is required')
],
async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){

        return res.status(400).json({errors: errors.array() })

    }

    const { email, password } = req.body;

    try {

        let user = await User.findOne({email})

        if(!user){
            return res
            .status(400)
            .json({errors:[{msg : 'Invalid Credentials'}]})
        }

        //check the password

        isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res
            .status(400)
            .json({errors:[{msg : 'Invalid Credentials'}]})

        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config. get('jwtSecret'),
            { expiresIn : 360000 },
            (err, token) => {
                if(err) throw err
                return res.json({ token })
            }
        )


        
    } catch (error) {
        return res
        .status(400)
        .json({
            "error" : error
        })
        
    }

})

router.get("/",auth,async (req,res) => {

    try {
        
        const user = await (await User.findById(req.user.id).select("-password"))
        res.json(user);

        
    } catch (error) {

        res
        .status(500)
        .send("Server Error")
        
    }

})

module.exports = router