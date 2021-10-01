import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Redirect } from 'react-router'

const Dashboard = () => {

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

    

    if (!loggedIn) {
        return <Redirect to="/register" />
    }

    return (
        <h1>Dashboard</h1>
    )
}

export default Dashboard