import React from 'react'
import '../styles/Header.css';
import { Link, useLocation } from 'react-router-dom';

import Logo from '../assets/ult-stats-favicon.svg'

export default function Header(props) {

    let location = useLocation().pathname;

    return (
        <header className='App-header'>
            <img className="App-logo" src={Logo} alt='Site Logo'></img>
            <h1 className={props.user ? 'header-title-user' : 'header-title-nouser'}>Ultimate Stats</h1>
            <div className='header-right'>
                {location !== '/' &&
                    <Link className='btn' to='/'>
                        Home
                    </Link>
                }
                {props.user && props.user.photoURL &&
                    <img className='profile-img' src={props.user.photoURL} alt='Profile' />
                }
                {props.user && !props.user.photoURL &&
                    <span className='material-icons md-36 profile-img'>account_circle</span>
                }
                {props.user &&
                    <button className='btn header-btn' onClick={() => {
                      // TODO - Confirmation Modal for Logout if there is an active game
                      // game will be lost
                      props.firebaseApp.auth().signOut();
                  }}>Sign Out</button>
                }
            </div>
        </header>
    )
}