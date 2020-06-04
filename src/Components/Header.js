import React from 'react'
import '../styles/Header.css';

import Logo from '../assets/ult-stats-favicon.svg'

export default function Header() {
    return (
        <header className='app-header'>
            <img className="app-logo" src={Logo} alt='Site Logo'></img>
            <h1>Ultimate Stats</h1>
        </header>
    )
}