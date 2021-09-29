const CronJob = require('cron').CronJob;
var moment = require('moment');

const date = '2021-09-28T14:40:04Z'

const year = moment(date).utc().year()
const month = moment(date).utc().month()
const day = moment(date).utc().day()
const hour = moment(date).utc().hour()
const minute = moment(date).utc().minute()

const job = new CronJob(
    '0 0 * * * *',
    function() {
        if (
            moment().utc().year() === year && 
            moment().utc().month() === month && 
            moment().utc().day() + 2 === day && 
            moment().utc().hour() === hour 
            // moment().utc().minute() + 2 === minute
        ) {
            console.log(moment().utc().format() + ': sending notification');
        }
    },
    null,
    true,
    ''
)