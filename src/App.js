// React
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { ToastContainer, cssTransition } from 'react-toastify';
import Timer from 'easytimer.js';

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
import Games from './Components/Games';
import OngoingGame from './Components/OngoingGame';
import NewGame from './Components/NewGame';
import Stats from './Components/Stats';
import Teams from './Components/Teams';

// helper functions
import { sortTeams } from './Utils/utils';

const Slide = cssTransition({
  enter: 'toast-in',
  exit: 'toast-out',
  duration: [500, 100]
})

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
export const db = firebaseApp.firestore();

function App() {

  // set state (global)
  const [currentGame, setCurrentGame] = useState(JSON.parse(localStorage.getItem('currentGame')) || null);
  const [isOffence, setIsOffence] = useState(localStorage.getItem('isOffence') === 'true');
  const [activePoint, setActivePoint] = useState(localStorage.getItem('activePoint') === 'true');
  const [changingLineUp, setChangingLineUp] = useState(localStorage.getItem('changingLineUp') === 'true');
  const [currentGameTime, setCurrentGameTime] = useState(localStorage.getItem('currentGameTime') || '00:00');
  const [currentPoint, setCurrentPoint] = useState(parseInt(localStorage.getItem('currentPoint')) || 1);
  const [currentPointLineUp, setCurrentPointLineUp] = useState(JSON.parse(localStorage.getItem('currentPointLineUp')) || []);
  const [dbUser, setDbUser] = useState(null);
  const [gameOptions, setGameOptions] = useState({
    statTeam: '',
    jerseyColour: 'Light',
    startingOn: 'Offence',
    opponent: '',
    gameFormat: { value: 7, label: `7 v 7` },
  });
  const [prevEntry, setPrevEntry] = useState(JSON.parse(localStorage.getItem('prevEntry')) || {});
  const [teamOptions, setTeamOptions] = useState([]);
  const [user, setUser] = useState(null);

  const gameTimer = useRef(new Timer({
    callback: (timer) => {
      let newTime = { ...currentGameTime };
      newTime = (timer.getTimeValues().toString(['minutes', 'seconds']));
      localStorage.setItem('currentGameTime', newTime);
      setCurrentGameTime(newTime);
    }
  }))

  // store ref of gameOptions
  let gameOptionsRef = useRef(gameOptions);

  const loadUser = useCallback(() => {
    // get the user from the db and load into state
    db.collection('users').where('uid', '==', user.uid)
      .get()
      .then(res => {
        res.forEach(doc => {
          setDbUser(doc.data());
          console.log('User fetched from database')
          // set the possible team options from the db
          let newTeamOptions = [];
          for (let team of Object.values(doc.data().teams)) {
            newTeamOptions.push({ value: team.name, label: team.name, teamID: team.teamID });
          };
          newTeamOptions.sort((a, b) => {
            return sortTeams(a.value, b.value)
          });
          setTeamOptions(newTeamOptions);
          let newGameOptions = { ...gameOptionsRef.current };
          newGameOptions.statTeam = newTeamOptions[0];
          setGameOptions(gameOptions => newGameOptions);
        });
      })
      .catch(error => console.log('Error loading User', error))
  }, [user]);

  useEffect(() => {
    // listen for auth state changes
    const unsubscribe = firebaseApp.auth().onAuthStateChanged(user => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);;
      } else {
        localStorage.removeItem('user');
        setUser(user);
        localStorage.removeItem('currentGame');
        setCurrentGame(null);
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

  // save game variables to localstorage to allow continuation of games on page reload
  useEffect(() => {
    if (currentGame) localStorage.setItem('currentGame', JSON.stringify(currentGame));
    localStorage.setItem('isOffence', isOffence);
    localStorage.setItem('activePoint', activePoint);
    localStorage.setItem('currentPoint', currentPoint);
    localStorage.setItem('currentPointLineUp', JSON.stringify(currentPointLineUp));
    localStorage.setItem('prevEntry', JSON.stringify(prevEntry));
    localStorage.setItem('changingLineUp', changingLineUp);
  }, [
      currentGame,
      isOffence,
      activePoint,
      currentPoint,
      currentPointLineUp,
      prevEntry,
      changingLineUp,
    ]);

  const resetTeamOptions = (newTeams) => {
    let newTeamOptions = [];
    for (let team of Object.values(newTeams)) {
      newTeamOptions.push({ value: team.name, label: team.name, teamID: team.teamID });
    };
    newTeamOptions.sort((a, b) => {
      return sortTeams(a.value, b.value)
    });
    setTeamOptions(newTeamOptions);
    let newGameOptions = { ...gameOptionsRef.current };
    newGameOptions.statTeam = newTeamOptions[0];
    setGameOptions(newGameOptions);
  }

  const resetGame = () => {
    gameTimer.current.stop();
    setActivePoint(false);
    setCurrentGame(null);
    setCurrentGameTime('00:00');
    setCurrentPoint(1);
    setCurrentPointLineUp([]);
    setPrevEntry({});
    setChangingLineUp(false);
  }

  return (
    <Router>
      <ToastContainer
        autoClose={4000}
        hideProgressBar
        newestOnTop={false}
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
          <OngoingGame
            currentGame={currentGame}
            resetGame={resetGame}
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
                currentGame={currentGame}
                db={db}
                dbUser={dbUser}
                resetTeamOptions={resetTeamOptions}
                setDbUser={setDbUser}
              />
              <OngoingGame
                currentGame={currentGame}
                resetGame={resetGame}
              />
            </> : <Redirect to='/' />
          }
        </Route>
        <Route path='/games' exact>
          {localStorage.getItem('user') ?
            <>
              <Header
                firebaseApp={firebaseApp}
                user={user}
              />
              <Games
                currentGame={currentGame}
                db={db}
                dbUser={dbUser}
              />
              <OngoingGame
                currentGame={currentGame}
                setCurrentGame={setCurrentGame}
              />
            </> : <Redirect to='/' />
          }
        </Route>
        <Route path='/newgame' exact>
          {localStorage.getItem('user') ?
            <>
              <Header
                firebaseApp={firebaseApp}
                user={user}
              />
              <NewGame
                currentGame={currentGame}
                gameTimer={gameTimer.current}
                db={db}
                dbUser={dbUser}
                gameOptions={gameOptions}
                setCurrentGame={setCurrentGame}
                setDbUser={setDbUser}
                setGameOptions={setGameOptions}
                setIsOffence={setIsOffence}
                teamOptions={teamOptions}
              />
            </> : <Redirect to='/' />
          }
        </Route>
        <Route path='/stats' exact>
          {currentGame ?
            <>
              <Header
                firebaseApp={firebaseApp}
                user={user}
              />
              <Stats
                activePoint={activePoint}
                changingLineUp={changingLineUp}
                currentGame={currentGame}
                currentGameTime={currentGameTime}
                currentPoint={currentPoint}
                currentPointLineUp={currentPointLineUp}
                gameTimer={gameTimer.current}
                db={db}
                dbUser={dbUser}
                isOffence={isOffence}
                prevEntry={prevEntry}
                setActivePoint={setActivePoint}
                setChangingLineUp={setChangingLineUp}
                setCurrentGame={setCurrentGame}
                setCurrentGameTime={setCurrentGameTime}
                setCurrentPoint={setCurrentPoint}
                setCurrentPointLineUp={setCurrentPointLineUp}
                setDbUser={setDbUser}
                setIsOffence={setIsOffence}
                setPrevEntry={setPrevEntry}
              />
            </> : <Redirect to='/newgame' />
          }
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
