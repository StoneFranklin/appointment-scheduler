import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Redirect } from 'react-router'

const Login = () => {

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

    

    if (loggedIn) {
        return <Redirect to="/" />
    }

    return (
        <h1>Login</h1>
    )
}

export default Login