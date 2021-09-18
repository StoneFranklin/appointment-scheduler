const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
require('dotenv').config({path: '../.env'});

const app = express()
const port = 5000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect(process.env.MONGO, 
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch(
        err => console.log(err)
    )

const { Schema } = mongoose

const userSchema = new Schema({
    firstName: String,
    lastName: String,
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

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', userSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const testSchema = new Schema({
    value: String
})

const Test = mongoose.model('Test', testSchema)

app.post('/register', (req, res) => {
    User.register({ username: req.body.username }, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
        } else {
            user.firstName = req.body.firstName
            user.lastName = req.body.lastName
            user.save()
            passport.authenticate('local')(req, res, function() {
                res.send('Registered')
            })
        }
    })
})

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function(err) {
        if (err) {
            res.send('Invalid username/password')
        } else {
            passport.authenticate('local')(req, res, function() {
                res.send('Log in successful')
            })
        }
    })
})

app.post('/appointment', (req, res) => {
    if(req.isAuthenticated()) {
        const newAppointment = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            date: req.body.date,
            hour: req.body.hour,
            minute: req.body.minute
        }
    }
})

app.get('logout', (req, res) => {
    req.logout()
})

app.get('/', (req, res) => {
    Test.find(function(err, users) {
        if(err) {
            res.send(err)
        } else {
            res.send(users)
        }
    })
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})