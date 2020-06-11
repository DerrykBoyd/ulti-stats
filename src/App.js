// React
import React, { useState, useEffect, useCallback } from 'react';
import {
    HashRouter as Router,
    Route,
    Switch,
    Redirect,
} from "react-router-dom";
import { ToastContainer, toast, Slide } from 'react-toastify';

// Firebase
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// styles
import './styles/App.css';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './Components/Header';
import Home from './Components/Home';
import Teams from './Components/Teams';
import Games from './Components/Games';
import NewGame from './Components/NewGame';


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

    // db functions
    const delTeam = (teamID) => {
        db.collection('users').doc(dbUser.uid)
            .update({
                [`teams.${teamID}`]: firebase.firestore.FieldValue.delete()
            })
            .then(() => {
                console.log('Team Deleted');
                // Toast for successful delete
                toast.error('Team Deleted');
            })
            .catch(e => console.log('Error deleting team', e))
    }

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
            .catch(error => console.log('Error loading User', error))
    }, [user]);

    const saveTeam = (newTeam, teamID) => {
        // update the User in the db from local state
        db.collection('users').doc(dbUser.uid)
            .update({
                [`teams.${teamID}`]: newTeam
            })
            .then(() => {
                console.log('Teams Updated')
                // Toast msg for successful save
                toast.success('Team Saved');
            })
            .catch(e => console.log('Error updating teams', e))
    }

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
            <ToastContainer
                autoClose={1000}
                hideProgressBar
                position='top-center'
                transition={Slide}
            />
            <Switch>
                <Route path='/' exact>
                    <Header
                        firebaseApp={firebaseApp}
                        user={user}
                    />
                    <Home
                        firebaseApp={firebaseApp}
                        uiConfig={uiConfig}
                    />
                </Route>
                <Route path='/teams' exact>
                    {localStorage.getItem('user') ?
                        <>
                            <Header
                                firebaseApp={firebaseApp}
                                user={user}
                            />
                            <Teams
                                db={db}
                                dbUser={dbUser}
                                delTeam={delTeam}
                                saveTeam={saveTeam}
                                setDbUser={setDbUser}
                            />
                        </> : <Redirect to='/' />
                    }
                </Route>
                <Route path='/games'>
                    {localStorage.getItem('user') ?
                        <>
                            <Header
                                firebaseApp={firebaseApp}
                                user={user}
                            />
                            <Games
                                db={db}
                                dbUser={dbUser}
                            />
                        </> : <Redirect to='/' />
                    }
                </Route>
                <Route path='/newgame'>
                    {localStorage.getItem('user') ?
                        <>
                            <Header
                                firebaseApp={firebaseApp}
                                user={user}
                            />
                            <NewGame
                                db={db}
                                dbUser={dbUser}
                            />
                        </> : <Redirect to='/' />
                    }
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
