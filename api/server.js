const express = require('express')
const mongoose = require('mongoose')

const app = express()
const port = 5000

const { Schema } = mongoose

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    appointments: [
        {
            firstName: String,
            lastName: String,
            phone: String,
            date: Date,
            hour: Number,
            minute: Number
        }
    ]
})

const User = mongoose.model('User', userSchema)

const testSchema = new Schema({
    value: String
})

const Test = mongoose.model('Test', testSchema)

app.post('/register', (req, res) => {
    
})

app.get('/', (req, res) => {
    res.send('Hello')
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})