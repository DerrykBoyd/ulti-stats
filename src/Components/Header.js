import React from 'react'
import '../styles/Header.css';

import Logo from '../assets/ult-stats-favicon.svg'

export default function Header(props) {
    return (
        <header className='App-header'>
            <img className="App-logo" src={Logo} alt='Site Logo'></img>
            <h1 className={props.user ? 'header-title-user' : 'header-title-nouser'}>Ultimate Stats</h1>
            <div className='header-right'>
                {props.user && props.user.photoURL &&
                    <img className='profile-img' src={props.user.photoURL} alt='Profile' />
                }
                {props.user && !props.user.photoURL &&
                    <span className='material-icons md-36 profile-img'>account_circle</span>
                }
                {props.user && 
                    <button className='btn signout-btn' onClick={() => props.firebaseApp.auth().signOut()}>Sign Out</button>
                }
            </div>
        </header>
    )
}