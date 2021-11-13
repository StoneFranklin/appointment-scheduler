const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const cors = require('cors')
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

// set up cors to allow us to accept requests from our client
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

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
    username: String,
    password: String,
    appointments: [
        {
            title: String,
            phone: String,
            start: Date,
            end: Date,
        }
    ]
})

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', userSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.post('/register', (req, res) => {
    User.register({ username: req.body.username }, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.send(err)
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

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


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
        console.log(req.body.start);
        console.log(req.body.end);
        const newAppointment = {
            title: `${req.body.firstName} ${req.body.lastName}`,
            phone: req.body.phone,
            start: req.body.start,
            end: req.body.end
        }
        User.findByIdAndUpdate(req.user._id, { $push: { appointments: newAppointment } }, function(err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                res.send(foundUser.appointments)
            }
        })
    } else {
        res.send('redirect')
    }
})

const CronJob = require('cron').CronJob;
const moment = require('moment');

const retrieveDates = () => {
    let appointments = []
    User.find({}, (err, foundUsers) => {
        if (err) {
            console.log(err);
        } else {
            foundUsers.forEach(element => {
                element.appointments.forEach(appointment => {
                    appointments.push(
                        {
                            start: appointment.start,
                            firstName: element.firstName,
                            lastName: element.lastName,
                            phone: appointment.phone
                        }
                    )
                })
            })
        }
    })
    
    return appointments
}
const appointments = retrieveDates()

const sendNotifications = () => {
    appointments.forEach(appointment => {
        const start = new Date(appointment.start)
        console.log(start);
        const year = start.getUTCFullYear()
        const month = start.getUTCMonth() + 1
        const day = start.getUTCDate()
        const hour = start.getUTCHours()
        const phone = appointment.phone
        console.log(year);
        console.log(month);
        console.log(day);
        console.log(hour);
        const today = new Date()
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        if (
            today.getUTCFullYear() === year && 
            today.getUTCMonth() + 1 === month && 
            today.getUTCDate() + 2 === day && 
            today.getUTCHours() === hour 
        ) {
            client.messages
                .create({
                    body: `You have an appointment with ${appointment.firstName} ${appointment.lastName} on ${start.toLocaleDateString("en-US", options)} at ${start.toLocaleTimeString("en-US", { hour12: true, hour: 'numeric', minute: 'numeric' })}`,
                    from: process.env.TWILIO_PHONE,
                    to: phone
                })
            console.log('sending now');
        }
    })
}

const scheduler = () => {
    new CronJob(
        '10 * * * * *',
        () => {
            sendNotifications()
        },
        null,
        true,
        ''
    )
}
scheduler()

app.get('/logout', (req, res) => {
    req.logout()
    res.send('logged out')
    if(req.isAuthenticated()) {
        console.log('Still logged in');
    } else {
        console.log('Logged out');
    } 
})

app.get('/check-session', (req, res) => {
    if(req.isAuthenticated()) {
        res.send('You are logged in')
    } else {
        res.send('redirect')
    }
    
})

app.get('/appointments', (req, res) => {
    if(req.isAuthenticated()) {
        User.findById(req.user._id, function(err, foundUser) {
            if(err) {
                console.log(err);
            } else {
                if(foundUser) {
                    res.send({
                        appointments: foundUser.appointments,
                        name: `${req.user.firstName} ${req.user.lastName}`
                    });
                }
            }
        })
    } else {
        res.send('redirect')
    }
})

app.delete('/appointments/:appointmentID', (req, res) => {
    User.findByIdAndUpdate(req.user._id, { $pull: { appointments: { _id: req.params.appointmentID } } }, function(err, foundUser) {
        if(err) {
            console.log(err);
        } else {
            res.send(foundUser);
        }
    });
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})