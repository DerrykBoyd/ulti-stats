// React
import React, { useState, useEffect, useCallback } from 'react';
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
import 'firebase/firestore';

// styles
import './styles/App.css';

// Components
import Header from './Components/Header';
import Home from './Components/Home';
import Teams from './Components/Teams';
import Games from './Components/Games';
import Stats from './Components/Stats';


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
  'credentialHelper': 'none',
  'signInFlow': 'popup'
}

// Instantiate a Firebase app and database
const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();

function App() {

  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);

  const loadUser = useCallback(() => {
    // get the user from the db and load into state
    db.collection('users').where('uid', '==', user.uid)
      .get()
      .then(res => {
        res.forEach(doc => {
          setDbUser(doc.data());
          console.log('User fetched')
        });
      })
      .catch(error => console.log('Error loading User'))
  }, [user])

  useEffect(() => {
    // listen for auth state changes
    const unsubscribe = firebaseApp.auth().onAuthStateChanged(user => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);;
        console.log(user);
      } else {
        localStorage.removeItem('user');
        setUser(user);
      }
    })
    // unsubscribe to the listener when unmounting
    return () => unsubscribe()
  }, []);

  useEffect(() => {
    if (user) {
      loadUser();
    }
  }, [user, loadUser]);

  return (
    <Router>
      <Switch>
        <Route path='/' exact>
          <Header
            user={user}
            firebaseApp={firebaseApp}
          />
          <Home
            firebaseApp={firebaseApp}
            uiConfig={uiConfig}
          />
        </Route>
        <Route path='/teams'>
          {localStorage.getItem('user') ?
            <>
              <Header
                user={user}
                firebaseApp={firebaseApp}
              />
              <Teams
                dbUser={dbUser}
                db={db}
              />
            </> : <Redirect to='/' />
          }
        </Route>
        <Route path='/games'>
          {localStorage.getItem('user') ?
            <>
              <Header
                user={user}
                firebaseApp={firebaseApp}
              />
              <Games
                dbUser={dbUser}
                db={db}
              />
            </> : <Redirect to='/' />
          }
        </Route>
        <Route path='/stats'>
          {localStorage.getItem('user') ?
            <>
              <Header
                user={user}
                firebaseApp={firebaseApp}
              />
              <Stats
                dbUser={dbUser}
                db={db}
              />
            </> : <Redirect to='/' />
          }
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
