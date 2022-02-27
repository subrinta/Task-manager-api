const express = require('express')
require('./db/mongoose')
const uesrRouter = require('./routers/userRouter')
const taskRouter = require('./routers/taskRouter')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(uesrRouter)
app.use(taskRouter)

app.listen(port, ()=>{
    console.log('srever is up on port: ', port)
})