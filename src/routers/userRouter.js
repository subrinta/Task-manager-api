const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWealcomeEmail, SendCancelationEmail } = require('../emails/account')
const router = express.Router()

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return cb(new Error('Please give a image file'))
        cb(undefined, true)
    }
})

// create user
router.post('/users', async (req, res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        sendWealcomeEmail(user.email, user.name)
        const tocken = await user.generateAutTocken()
        res.status(201).send({user, tocken})
    } catch(e) {
        res.status(400).send(e)
    }

    // user.save().then(
    //     ()=> {res.send(user)}
    // ).catch(
    //     (e)=>{res.status(400).send(e)}
    // )
})

// login user
router.post('/users/login', async (req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const tocken = await user.generateAutTocken()
        res.send({user, tocken})
    } catch(e){
        res.status(400).send('Unable to login')
    }
})
//logout
router.post('/users/logout', auth, async(req, res)=>{
    try{
        const tocken = req.tocken
        const user = req.myuser

        user.tockens = user.tockens.filter((usertocken)=>{
            usertocken.tocken !== tocken
        })

        await user.save()
        res.send()
    } catch(e){
        res.status(500).send()
    }
})
//logoutall
router.post('/users/logoutAll', auth, async (req, res)=>{
    try{
        const user =req.myuser
        user.tockens=[]
        await user.save()
        res.send()
    } catch(e){
        res.status(500).send()
    }
})

//upload profile picture
router.post('/users/me/upload', auth, upload.single('avatar'), async(req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.myuser.avatar = buffer
    await req.myuser.save()
    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({ error: error.message })
})

// view users
router.get('/users/me',auth, async (req, res)=>{
    
    try{
        const user = req.myuser
        const tocken = req.tocken
        res.send({user, tocken})
    } catch(e){
        res.status(500).send(e)
    }
    // User.find({}).then(
    //     (users)=>res.send(users)
    // ).catch((e)=>{
    //     res.status(400).send()
    // })
})

//Update own profile
router.patch('/users/me', auth, async (req, res)=>{

    const fieldsForUpdate = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const valid = fieldsForUpdate.every((property)=>allowedUpdates.includes(property))

    if(!valid)
        return res.status(400).send("This property can't be updated")

    try{
        const user = req.myuser
        fieldsForUpdate.forEach((field)=>{
            user[field]=req.body[field]
        })
        await user.save()
        res.send(user)
    } catch(e){
        res.status(500).send
    }
})

//view user image
router.get('/users/:id/avatar', async (req, res)=>{
    const user = await User.findById(req.params.id)
    try{
        if(!user || !user.avatar)
            throw new Error()
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch(e){
        res.status(404).send('not found')
    }
})
//Delete own profile
router.delete('/users/me', auth, async (req, res)=>{
    try{
        SendCancelationEmail(req.myuser.email, req.myuser.name)
        await req.myuser.remove()
        res.send('user deleted successfully')
    } catch(e){
        res.status(500).send()
    }
})

//delete profile picture
router.delete('/users/me/avatar', auth, async(req, res)=>{
    req.myuser.avatar = undefined
    await req.myuser.save()
    res.send()
})

module.exports = router