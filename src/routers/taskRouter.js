const express = require('express')
const Task = require('../models/tasks')
const auth = require('../middleware/auth')
const router = express.Router()

//create task
router.post('/tasks', auth, async (req, res)=>{
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.myuser._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    } catch(e){
        res.status(400).send(e)
    }
    // task.save().then(
    //     ()=>res.send(task)
    // ).catch(
    //     (e)=>res.status(400).send(e)
    // )
})

//view all tasks with filtering and pagination
//GET /tasks?completed=false
//GET /tesks?limit=3&skip=3
//GET /tasks?sortedBy=attributename:asc
router.get('/tasks', auth, async (req, res)=>{
    const match ={}
    if(req.query.completed){
        match.compleated = (req.query.completed === 'true')
    }

    const sort ={}
    if(req.query.sortBy){
        const part = req.query.sortBy.split(':')
        sort[part[0]]= (part[1]=='desc')? -1:1
    }

    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)

    try{
        // const tasks = await Task.find({ owner: req.myuser._id })
        await req.myuser.populate({
            path: 'task',
            match,
            options:{
                limit,
                skip,
                sort
            }
        })
        res.send(req.myuser.task)
    } catch(e){
        res.status(500).send(e)
    }
    // Task.find({}).then(
    //     (tasks)=>{
    //         res.send(tasks)
    //     }
    // ).catch(
    //     (e)=>res.status(500).send(e)
    // )
})

//view a task by ID
router.get('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id

    try{
        const task = await Task.findOne({_id: _id, owner: req.myuser._id})
        console.log(task)
        if(!task)
            return res.status(404).send('Task not found')
        res.send(task)
    } catch(e){
        res.status(404).send(e)
    }
    // Task.findById(_id).then(
    //     (task)=>{
    //         if(!task)
    //             return res.status(404).send()
    //         res.send(task)
    //     }
    // ).catch(
    //     (e)=>{
    //         res.status(500).send(e)
    //     }
    // )
})

//Update Task
router.patch('/tasks/:id', auth, async (req, res)=>{
    const propertiesToUpdate = Object.keys(req.body)
    const allowedUpdates = ['description', 'compleated']
    const valid = propertiesToUpdate.every((property)=>allowedUpdates.includes(property))

    if(!valid)
        return res.status(400).send('these properties cann\'t be updated')
    try{
        const task = await Task.findOneAndUpdate({_id: req.params.id, owner: req.myuser._id}, req.body, {new: true, runValidators: true})
        if(!task)
            return res.status(404).send('Unable to Update')
        res.send(task)
    } catch(e){
        res.status(500).send(e)
    }
})

//delete a task 
router.delete('/tasks/:id', auth, async (req, res)=>{
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.myuser._id})
        if(!task)
            return res.status(404).send('Unable to Delete')
        res.send(task)
    } catch(e){
        res.status(500).send(e)
    }
})

module.exports = router