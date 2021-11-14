import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Redirect } from 'react-router'
import { Link } from 'react-router-dom'
import { TextField, Button, Grid } from '@mui/material'
import '../App.css'

// Page containing login form
const Login = () => {
    const [loggedIn, setLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
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
    
    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const submit = (event) => {
        event.preventDefault()
        axios.post('http://localhost:5000/login', {
            username: username,
            password: password
        }, { withCredentials: true })
        .then((response) => {
            if (response.data === 'Log in successful') {
                setLoggedIn(true)
            }
        })
        .catch((error) => {
            console.log(error);
            setUsernameError('Invalid username/password')
        })
    }

    if (loggedIn) {
        return <Redirect to="/" />
    }

    return (
        <div className="register-container">
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
                        <TextField required id="outlined-basic" label="Username" variant="outlined" value={username} onChange={handleUsernameChange} />
                        <TextField required id="outlined-basic" type="password" label="Password" variant="outlined" value={password} onChange={handlePasswordChange} />
                        <Button variant="contained" type="submit" id="login-button">Log In</Button>
                    </form>
                </Grid>
                <Grid item>
                    <Link to="/register" className="link">
                        Create an account    
                    </Link>
                </Grid>
            </Grid>
            <Grid item xs={false} sm={4} md={7} className="register-right-side" />
        </Grid>
    </div>
    )
}

export default Login