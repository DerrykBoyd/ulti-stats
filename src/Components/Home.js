import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import Header from './Header';

// Firebase
import firebase from 'firebase/app';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

export default function Home(props) {

    let user = props.user;

    return (
        <div className='App'>
            <Header />
            <div className="main-content">
                <header className="App-header">
                    {user &&
                        <div>
                            <button onClick={() => props.firebaseApp.auth().signOut()}>Sign Out</button>
                            <p>Welcome {user.displayName}</p>
                        </div>
                    }
                    <p>
                        App for tracking Ultimate statistics
              </p>
                    {!user &&
                        <div id="login-form" className="login-form">
                            <StyledFirebaseAuth uiConfig={props.uiConfig} firebaseAuth={props.firebaseApp.auth()} />
                        </div>
                    }
                </header>
            </div>
        </div>
    )
}
