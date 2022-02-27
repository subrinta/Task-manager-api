const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')
const req = require('express/lib/request')
//the schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: [true, 'email already exist'],
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error('Email is not valid')
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minLength: [7, 'pass length should be greater than 6'],
        validate(value){
            if(value.toLowerCase().includes('password'))
                throw new Error('password is not safe')
        }
    },
    age: {
        type: Number
    },
    avatar: {
        type: Buffer
    },
    tockens:[{
        tocken:{
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

//virtual field
userSchema.virtual('task', {
    ref: 'Task',
    localField: '_id',
    foreignField:'owner'
})

//middleware of save
userSchema.pre('save', async function (next) {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

//middleware of remove
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

// function on a instance (a ures)
userSchema.methods.generateAutTocken = async function(){
    const user = this
    console.log(process.env.TOR_MA_KE)
    const tocken = jwt.sign({_id: user.id.toString()}, process.env.JWT_SECRET)
    user.tockens = user.tockens.concat({tocken})
    await user.save()
    return tocken
}

userSchema.methods.toJSON = function(){
    const userObject = this.toObject()
    delete userObject.password
    delete userObject.tockens
    return userObject
}

//function on the model(whole Users)
userSchema.statics.findByCredentials =async (email, password) => {
    const user = await User.findOne({email})
    if(!user)
        throw new Error('Unable to login')

    const isPasswordOk = await bcrypt.compare(password, user.password)
    if(!isPasswordOk){
        throw new Error('Unable to login')
    }

    return user    
    
}

const User = mongoose.model('User', userSchema)

module.exports = User