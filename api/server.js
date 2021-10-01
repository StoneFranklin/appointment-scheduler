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
        const newAppointment = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            date: req.body.date,
        }
        User.findByIdAndUpdate(req.user._id, { $push: { appointments: newAppointment } }, function(err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                res.send(foundUser.appointments)
            }
        })
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
                            date: appointment.date,
                            firstName: element.firstName,
                            lastName: element.lastName
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
        const year = moment(appointment.date).utc().year()
        const month = moment(appointment.date).utc().month()
        const day = moment(appointment.date).utc().day()
        const hour = moment(appointment.date).utc().hour()

        if (
            moment().utc().year() === year && 
            moment().utc().month() === month && 
            moment().utc().day() + 2 === day && 
            moment().utc().hour() === hour 
        ) {
            client.messages
                .create({
                    body: `You have an appointment with ${appointment.firstName} ${appointment.lastName} on ${appointment.date}`,
                    from: process.env.TWILIO_PHONE,
                    to: process.env.STONE_PHONE
                })
            console.log('sending now');
        }
    })
}


const scheduler = () => {
    new CronJob(
        '0 0 * * * *',
        () => {
            sendNotifications()
        },
        null,
        true,
        ''
    )
}
scheduler()

app.get('logout', (req, res) => {
    req.logout()
})

app.get('/check-session', (req, res) => {
    if(req.isAuthenticated()) {
        res.send('You are logged in')
    } else {
        res.send('redirect')
    }
    
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})