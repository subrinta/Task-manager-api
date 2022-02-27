const jwt = require('jsonwebtoken')
const User = require('../models/user')
const auth = async (req, res, next)=>{
    try{
        const tocken = req.header('Authorization').replace('Bearer ', '')
        console.log(process.env.TOR_MA_KE)
        const decoded = jwt.verify(tocken, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decoded._id, 'tockens.tocken': tocken})
        if(!user)
            throw new Error()

        req.tocken = tocken
        req.myuser = user
        next()
    } catch(e){
        res.status(400).send('Authorization error')
    }
}

module.exports = auth