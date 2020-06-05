import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import Header from './Header';
import screenshot from '../assets/home-screenshot.svg';

// Firebase
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

export default function Home(props) {

    let user = props.user;

    return (
        <div className='App'>
            <Header
                user={props.user}
                firebaseApp={props.firebaseApp}
            />
            <div className="home-main">
                {user &&
                    <div className='card'>
                        <p>Welcome {user.displayName}</p>
                        <Link to='/test'>
                            <button className='btn'>Test</button>
                        </Link>
                    </div>
                }
                {!user &&
                    <>
                        <div id='home-info'>
                            <div>
                                <p className='home-primary'>Tracking statistics for Ultimate games. </p>
                                <p className='text-dark-med home-secondary'>Ultimate Stats is a mobile friendly web app that lets you
                                    quickly and easily track statistics during an Ultimate game.</p>
                            </div>
                            <div id="login-form" className="login-form">
                                <StyledFirebaseAuth uiConfig={props.uiConfig} firebaseAuth={props.firebaseApp.auth()} />
                            </div>
                        </div>
                        <div className='card home-screenshot-card'>
                            <p className='card-title'>
                                Screenshot Here
                            </p>
                            <img id='home-screenshot' className='scaled-img' src={screenshot} alt="Home Screenshot"/>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}
