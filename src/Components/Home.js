import React from 'react';
import { Link } from 'react-router-dom';

// styles
import '../styles/Home.css';

// images
import screenshot from '../assets/home-screenshot.svg';

// Firebase
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

export default function Home(props) {

  let user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className='App'>
      <div className={`home-main ${props.currentGame && 'home-pad-btm-alert'}`}>
        {user &&
          <div className='home-btn-group'>
            <Link
              className='btn btn-primary'
              to='/teams'>My Teams
                                </Link>
            <Link
              className='btn btn-primary'
              to='/games'>My Games
                                </Link>
            {(!localStorage.getItem('currentGame') || localStorage.getItem('currentGame') === 'null') &&
              <Link
                className='btn btn-green'
                to='/newgame'
              >Start New Game</Link>
            }
          </div>
        }
        {!user &&
          <>
            <div id='home-info'>
              <div>
                <p className='home-primary'>Statistics for Ultimate games. </p>
                <p className='text-dark-med home-secondary'>Ultimate Stats is a mobile friendly web app that lets you
                                    quickly and easily track statistics during Ultimate games.</p>
              </div>
              <div id="login-form" className="login-form">
                <StyledFirebaseAuth uiConfig={props.uiConfig} firebaseAuth={props.firebaseApp.auth()} />
              </div>
            </div>
            <div className='card home-screenshot-card'>
              <p className='card-title'>
                Screenshot Here
                            </p>
              <img id='home-screenshot' className='scaled-img' src={screenshot} alt="Home Screenshot" />
            </div>
          </>
        }
      </div>
    </div>
  )
}
