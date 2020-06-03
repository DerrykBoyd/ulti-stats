import React, { useState, useEffect } from 'react';

import firebase from 'firebase/app';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import './App.css';

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

// Instantiate a Firebase app.
const firebaseApp = firebase.initializeApp(firebaseConfig);

function App() {

  const [user, setUser] = useState(null);

  const uiConfig = {
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
  }

  useEffect(() => {
    // listen for auth state changes
    const unsubscribe = firebaseApp.auth().onAuthStateChanged(user => {
      setUser(user)
      console.log(user)
      document.getElementById("login-form").classList.remove("hide");
    })
    // unsubscribe to the listener when unmounting
    return () => unsubscribe()
  }, [])


  return (
    <div className="App">
      {!user &&
        <div id="login-form" className="login-form hide">
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebaseApp.auth()} />
        </div>
      }
      {user &&
        <header className="App-header">
          <button onClick={() => firebaseApp.auth().signOut()}>Sign Out</button>
          <p>Welcome {user.displayName}</p>
          <p>
            App for tracking Ultimate statistics
        </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
        </a>
        </header>}
    </div>
  );
}

export default App;
