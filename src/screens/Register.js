import React, { useState, useEffect } from 'react'
import { TextField, Button } from '@mui/material'
import '../App.css'
import axios from 'axios'
import { Redirect } from 'react-router-dom'

const Register = () => {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [redirect, setRedirect] = useState(false)
    const [loggedIn, setLoggedIn] = useState(true)

    useEffect(() => {
        axios.get('http://localhost:5000/check-session', { withCredentials: true })
        .then((response) => {
            console.log(response.data);
            if(response.data === 'redirect') {
                setLoggedIn(false)
            }
        })
    }, [])

    const handleFirstNameChange = (event) => {
        setFirstName(event.target.value)
    }

    const handleLastNameChange = (event) => {
        setLastName(event.target.value)
    }

    const handleEmailChange = (event) => {
        setEmail(event.target.value)
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    

    const submit = (event) => {
        event.preventDefault()
        axios.post('/register', {
            firstName: firstName,
            lastName: lastName,
            username: email,
            password: password
        }, { withCredentials: true })
        .then((response) => {
            console.log(response.data);
            if (response.data === 'Registered') {
                setLoggedIn(true)
            }
        })
        .catch((error) => {
            console.log(error);
        })
    }

    if (loggedIn) {
        return <Redirect to="/" />
    }

    return (
        <div className="register-container">
            <div className="register-left-side">
                <form className="register-form" onSubmit={submit}>
                    <TextField id="outlined-basic" label="First Name" variant="outlined" value={firstName} onChange={handleFirstNameChange} />
                    <TextField id="outlined-basic" label="Last Name" variant="outlined" value={lastName} onChange={handleLastNameChange} />
                    <TextField id="outlined-basic" label="Email" variant="outlined" value={email} onChange={handleEmailChange} />
                    <TextField id="outlined-basic" label="Password" variant="outlined" value={password} onChange={handlePasswordChange} />
                    <Button variant="contained" type="submit">Register</Button>
                </form>
            </div>
            <div className="register-right-side">

            </div>
        </div>
    )
}

export default Register