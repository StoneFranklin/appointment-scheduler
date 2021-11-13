import React, { useState } from 'react'
import '../App.css'
import axios from 'axios'
import { Redirect } from 'react-router'
import { Button, Menu, MenuItem } from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const TopBar = (props) => {
    const [loggedIn, setLoggedIn] = useState(true)
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handleClose = () => {
        setAnchorEl(null);
    }

    const handleLogout = () => {
        setAnchorEl(null)
        axios.get('http://localhost:5000/logout', { withCredentials: true })
        .then((response) => {
            if(response.data === 'logged out') {
                setLoggedIn(false)
            }
        })
    }

    if (!loggedIn) {
        return <Redirect to="/landing" />
    }

    return (
        <div className="top-bar">
            <div className="topbar-logo">
                <p>Appointment Scheduler</p>
            </div>
            <div className="topbar-right">
                <h3 className="username">{props.name}</h3>
                <Button
                    id="basic-button"
                    aria-controls="basic-menu"
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    <AccountCircleIcon />
                </Button>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                    'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </div>
        </div>
    )
}

export default TopBar
