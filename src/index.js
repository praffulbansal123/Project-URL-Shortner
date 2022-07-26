const express = require('express')
const mongoose = require('mongoose')
const route = require('./route/route')
const dotenv = require('dotenv').config()
const createError = require('http-errors')
const morgan = require('morgan')

//Intialize the app
const app = express()

//To get route log in console
app.use(morgan('dev'))

//Parsing the request
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//Database intialization
const options = {
    useNewUrlParser: true
}
mongoose.connect(process.env.MONGOOSE_URI, options)
.then( () => console.log("MongoDB is connected"))
.catch( err => console.log(err))

// diverting incoming request to router
app.use('/', route)

// checking invalid route
app.use(async (req,res,next) => {
    next(createError.NotFound('This route does not exits'))
})

// Intializing error-handling
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({status: err.status || 500, status1: false, mssg: err.message})
})


app.listen(process.env.PORT, function() {
    console.log('Express app is running on port ' + (process.env.PORT))
})

