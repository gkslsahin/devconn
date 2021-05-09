const express = require("express")
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require("../../middleware/auth")

const Post = require("../../models/Post")
const Profile = require("../../models/Profile")
const Users = require("../../models/Users")

// @route    POST api/post
// @desc     create post
// @acess    Private
router.post("/", 
    auth,
    check('text', 'Text is required').notEmpty(),
        
    async (req,res) => {
        console.log(req.text)
        const errors = validationResult(req)
        
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array() })
        }

        try {
            const user = await User.findById(req.user.id).select('-password')

            const newPost = new Post({
                text : req.body.text,
                name : user.name,
                avatar : user.avatar,
                user: req.user.id
    
            })

            const post = await newPost.save()

            res.json(post)

        } catch (error) {
            console.log(error.message)
            res.status(500).send('Server Error')
            
        }


    }
)

// @route    GET api/post
// @desc     get all posts
// @acess    Private

router.get("/",auth, async (req,res) =>{

    try {
        const posts = await Post.find().sort({ date: -1 })
        res.json(posts)
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server Error')
    }


})


// @route    GET api/post/:id
// @desc     get post
// @acess    Private
router.get("/:id",auth, async (req,res) =>{

    try {
        const post = await Post.findById(req.params.id)

        if(!post){
            return res.status(404).json({ msg: 'Post not found' })
        }

        res.json(post)
        
    } catch (error) {
        console.log(error.message)

        
        if(error.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found' })
        }

        res.status(500).send('Server Error')
    }

})


// @route    DELETE api/post/:id
// @desc     get all posts
// @acess    Private

router.delete("/:id",auth, async (req,res) =>{

    try {
        const post = await Post.findById(req.params.id)
        
        if(!post){
            return res.status(404).json({ msg: 'Post not found' })
        }
        
        //check user
        if(post.user.toString() != req.user.id){
            return res.status(401).json({ msg: 'User not authorized' })
        }

        await post.remove()

        return res.json({msg : "Post removed"})


        
    } catch (error) {
        console.log(error.message)
        if(error.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found' })
        }
        res.status(500).send('Server Error')
    }


})

module.exports = router