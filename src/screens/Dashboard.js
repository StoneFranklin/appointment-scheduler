import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Redirect } from 'react-router'
import { Button, TextField, Modal } from '@mui/material'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import TopBar from '../components/TopBar'

// Page contianing the calendar. Main page of the appliction, allowing users to create and delete appointments.
const Dashboard = () => {
    const [loggedIn, setLoggedIn] = useState(true)
    const [appointments, setAppointments] = useState([])
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')
    const [openCreate, setOpenCreate] = useState(false)
    const [openExisting, setOpenExisting] = useState(false)
    const [existingTitle, setExistingTitle] = useState('')
    const [existingId, setExistingId] = useState('')
    const [username, setUsername] = useState('')
    const [isError, setIsError] = useState(false)
    const [errorText, setErrorText] = useState('')

    const handleOpenCreate = ({ start, end }) => {
        setOpenCreate(true)
        setStart(start)
        setEnd(end)
    }
    
    const handleCloseCreate = () => setOpenCreate(false)

    const handleOpenExisting = (event) => {
        setExistingTitle(event.title)
        setExistingId(event._id)
        setOpenExisting(true)
    }

    const handleCloseExisting = () => setOpenExisting(false)

    const convertDates = (appointments) => {
        let output = []
        appointments.forEach(appointment => {
            output.push(
                {
                    title: appointment.title,
                    phone: appointment.phone,
                    start: new Date(appointment.start),
                    end: new Date(appointment.end),
                    _id: appointment._id
                }
            )
        })
        return output
    }

    const retrieveAppointments = () => {
        axios.get('http://localhost:5000/appointments', { withCredentials: true })
        .then((response) => {
            if(response.data === 'redirect') {
                setLoggedIn(false)
            } else {
                setAppointments(convertDates(response.data.appointments))
                setUsername(response.data.name)
            }
        })
    }

    useEffect(() => {
        retrieveAppointments()
    })

    const handleFirstNameChange = (event) => {
        setFirstName(event.target.value)
    }

    const handleLastNameChange = (event) => {
        setLastName(event.target.value)
    }

    const handlePhoneChange = (event) => {
        setPhone(event.target.value)
    }

    const clearTextfields = () => {
        setFirstName('')
        setLastName('')
        setPhone('')
    }

    const submit = (event) => {
        event.preventDefault()
        if(phone.length !== 10) {
            setErrorText('Please enter a valid phone number')
            setIsError(true)
        } else {
            setErrorText('')
            setIsError(false)
            axios.post('http://localhost:5000/appointment', {
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                start: start,
                end: end
            }, { withCredentials: true })
            .then((response) => {
                if (response.data === 'redirect') {
                    setLoggedIn(false)
                } else {
                    setAppointments(convertDates(response.data))
                    retrieveAppointments()
                    handleCloseCreate()
                }
            })
        }
        clearTextfields()
    }

    const deleteAppointment = (event) => {
        event.preventDefault()
        axios.delete(`http://localhost:5000/appointments/${existingId}`, { withCredentials: true } )
        .then(res =>  {
            retrieveAppointments()
            handleCloseExisting()
        })
        .catch(err => console.log(err))
    }

    const localizer = momentLocalizer(moment)

    if (!loggedIn) {
        return <Redirect to="/landing" />
    }

    return (
        <div className="dashboard-container">
            <TopBar name={username} />
            <div>
                <Calendar
                selectable
                localizer={localizer}
                events={appointments}
                defaultView={Views.WEEK}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '90vh'}}
                onSelectEvent={handleOpenExisting}
                onSelectSlot={handleOpenCreate}
                />
            </div>
            <Modal
                open={openCreate}
                onClose={handleCloseCreate}
            >
                <div className="form-container">
                    <form className="appointment-form" onSubmit={submit}>
                        <TextField required id="outlined-basic" label="First Name" variant="outlined" value={firstName} onChange={handleFirstNameChange} className="text-box" />
                        <br />
                        <TextField required id="outlined-basic" label="Last Name" variant="outlined" value={lastName} onChange={handleLastNameChange} className="text-box" />
                        <br />
                        <TextField required error={isError} helperText={errorText} id="outlined-basic" type="tel" label="Phone" variant="outlined" value={phone} onChange={handlePhoneChange} className="text-box" />
                        <br />
                        <Button variant="contained" type="submit" id="create-button">Create Appointment</Button>
                    </form>
                </div>
            </Modal>
            <Modal
                open={openExisting}
                onClose={handleCloseExisting}
            >
                <div className="form-container">
                    <form className="appointment-form" onSubmit={deleteAppointment}>
                        <h1>{existingTitle}</h1>
                        <Button variant="contained" type="submit" id="create-button">Delete Appointment</Button>
                    </form>
                </div>
            </Modal> 
        </div> 
    )
}

export default Dashboard