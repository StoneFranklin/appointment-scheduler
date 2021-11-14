import React, { useState, useEffect } from 'react'
import { TextField, Button, Grid } from '@mui/material'
import '../App.css'
import axios from 'axios'
import { Redirect, Link } from 'react-router-dom'

// Page containing register form
const Register = () => {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loggedIn, setLoggedIn] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const [passwordErrorText, setPasswordErrorText] = useState('')
    const [usernameError, setUsernameError] = useState('')

    useEffect(() => {
        axios.get('http://localhost:5000/check-session', { withCredentials: true })
        .then((response) => {
            console.log(response.data);
            if(response.data !== 'redirect') {
                setLoggedIn(true)
            }
        })
    }, [])

    const handleFirstNameChange = (event) => {
        setFirstName(event.target.value)
    }

    const handleLastNameChange = (event) => {
        setLastName(event.target.value)
    }

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const submit = (event) => {
        event.preventDefault()
        if(password.length < 8) {
            setPasswordError(true)
            setPasswordErrorText('Password must be at leat 8 characters.')
        } else {
            setPasswordError(false)
            setPasswordErrorText('')
            axios.post('http://localhost:5000/register', {
                firstName: firstName,
                lastName: lastName,
                username: username,
                password: password
            }, { withCredentials: true })
            .then((response) => {
                console.log(response.data);
                if (response.data === 'Registered') {
                    setLoggedIn(true)
                } else {
                    setUsernameError(response.data.message)
                }
            })
            .catch((error) => {
                console.log(error);
            })
        }
    }

    if (loggedIn) {
        return <Redirect to="/" />
    }

    return (
        <Grid container className="register-container">
            <Grid 
                item 
                container 
                direction="column" 
                justifyContent="flex-start" 
                alignItems="center" 
                xs={12} 
                sm={8} 
                md={5} 
                className="register-left-side"
            > 
                <Grid item className={usernameError.length > 0 ? "error-box" : "invisible"}>
                    {usernameError}
                </Grid>
                <Grid item className="grid-max">
                    <form className="register-form" onSubmit={submit}>
                        <TextField required id="outlined-basic" label="First Name" variant="outlined" value={firstName} onChange={handleFirstNameChange} />
                        <TextField required id="outlined-basic" label="Last Name" variant="outlined" value={lastName} onChange={handleLastNameChange} />
                        <TextField required id="outlined-basic" label="Username" variant="outlined" value={username} onChange={handleUsernameChange} />
                        <TextField required error={passwordError} helperText={passwordErrorText} id="outlined-basic" type="password" label="Password" variant="outlined" value={password} onChange={handlePasswordChange} />
                        <Button variant="contained" type="submit" id="login-button">Register</Button>
                    </form>
                </Grid>
                <Grid item>
                    <Link to="/login" className="link">
                        Already have an account?
                    </Link>
                </Grid>
            </Grid>
            <Grid item xs={false} sm={4} md={7} className="register-right-side" />
        </Grid>
    )
}

export default Register