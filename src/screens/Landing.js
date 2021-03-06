import React, { useState, useEffect } from "react"
import Earth from '../components/Earth'
import { Suspense } from "react"
import { Button } from "@mui/material"
import axios from 'axios'
import { Redirect } from 'react-router'

// Page that houses the 3D model of Earth and links to register or log in
const Landing = () => {
    const [loggedIn, setLoggedIn] = useState(false)

    useEffect(() => {
        axios.get('http://localhost:5000/check-session', { withCredentials: true })
        .then((response) => {
            console.log(response.data);
            if(response.data !== 'redirect') {
                setLoggedIn(true)
            }
        })
    }, [])

    if (loggedIn) {
        return <Redirect to="/" />
    }

    return (
        <div className="landing-container"> 
            <div className="logo">
                <p>Appointment Scheduler</p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <Earth />
            </Suspense>
            <div className="button-container">
                <Button variant="contained" id="landing-button" href="/register">Register</Button>
                <Button variant="contained" id="landing-button" href="/login">Login</Button>
            </div>
        </div>
    )
}

export default Landing