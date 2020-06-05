// React
import React, { useState, useEffect } from 'react';
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
  Link
} from "react-router-dom";

// Firebase
import firebase from 'firebase/app';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

// styles
import './styles/App.css';

// Components
import Home from './Components/Home';

const firebaseConfig = {
  apiKey: "AIzaSyBqJvH9x13wUFJhaBjCqkxUPesQ7Fm0YXg",
  authDomain: "ultimate-stats-3bdf2.firebaseapp.com",
  databaseURL: "https://ultimate-stats-3bdf2.firebaseio.com",
  projectId: "ultimate-stats-3bdf2",
  storageBucket: "ultimate-stats-3bdf2.appspot.com",
  messagingSenderId: "499792401385",
  appId: "1:499792401385:web:2336eacc08c88a3fb8b178",
  measurementId: "G-ZSK5SCD0YF"
};

const uiConfig = {
  signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  'credentialHelper': 'none'
}

// Instantiate a Firebase app.
const firebaseApp = firebase.initializeApp(firebaseConfig);

function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    // listen for auth state changes
    const unsubscribe = firebaseApp.auth().onAuthStateChanged(user => {
      setUser(user)
      console.log(user)
      // document.getElementById("login-form").classList.remove("hide");
    })
    // unsubscribe to the listener when unmounting
    return () => unsubscribe()
  }, [])


  return (
    <Router>
      <Switch>
        <Route path='/' exact>
          <Home 
            user={user}
            firebaseApp={firebaseApp}
            uiConfig={uiConfig}
          />
        </Route>
        <Route path='/test'>
          {user ?
            <div className="App">
              <header className="main-content">
                {user &&
                  <div>
                    <button className='btn' onClick={() => firebaseApp.auth().signOut()}>Sign Out</button>
                    <Link to='/'>
                      <button className='btn'>Home</button>
                    </Link>
                    <p>Welcome {user.displayName}</p>
                  </div>
                }
                <p>
                  TESTING ROUTER - SHOULD ONLY SHOW IF LOGGED IN
              </p>
                {!user &&
                  <div id="login-form" className="login-form">
                    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebaseApp.auth()} />
                  </div>
                }
              </header>
            </div> : <Redirect to='/' />}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
