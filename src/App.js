// React
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { ToastContainer, cssTransition, toast } from 'react-toastify';
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
import LogOutModal from './Components/LogOutModal';

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
  const [activePoint, setActivePoint] = useState(localStorage.getItem('activePoint') === 'true');
  const [activeTimeOut, setActiveTimeOut] = useState(localStorage.getItem('activeTimeOut') === 'true');
  const [currentGame, setCurrentGame] = useState(JSON.parse(localStorage.getItem('currentGame')) || null);
  const [changingLineUp, setChangingLineUp] = useState(localStorage.getItem('changingLineUp') === 'true');
  const [currentGameTime, setCurrentGameTime] = useState(localStorage.getItem('currentGameTime') || '00:00');
  const [currentGameTimeSecs, setCurrentGameTimeSecs] = useState(localStorage.getItem('curTimeSecs') || 0);
  const [currentPoint, setCurrentPoint] = useState(parseInt(localStorage.getItem('currentPoint')) || 1);
  const [currentPointLineUp, setCurrentPointLineUp] = useState(JSON.parse(localStorage.getItem('currentPointLineUp')) || []);
  const [dbUser, setDbUser] = useState(null);
  const [fetchedGames, setFetchedGames] = useState([]);
  const [gameOptions, setGameOptions] = useState({
    statTeam: '',
    jerseyColour: 'Light',
    startingOn: 'Offence',
    opponent: '',
    gameFormat: { value: 7, label: `7 v 7` },
  });
  const [isOffence, setIsOffence] = useState(localStorage.getItem('isOffence') === 'true');
  const [lastGameDoc, setLastGameDoc] = useState(null);
  const [logOutWarning, setLogOutWarning] = useState(false);
  const [pendingDel, setPendingDel] = useState(false);
  const [prevEntry, setPrevEntry] = useState(JSON.parse(localStorage.getItem('prevEntry')) || {});
  const [teamOptions, setTeamOptions] = useState([]);
  const [user, setUser] = useState(null);

  const gameTimer = useRef(new Timer({
    callback: (timer) => {
      let newTime = (timer.getTimeValues().toString(['minutes', 'seconds']));
      let newTimeSecs = (timer.getTotalTimeValues().seconds);
      localStorage.setItem('currentGameTime', newTime);
      localStorage.setItem('curTimeSecs', newTimeSecs);
      setCurrentGameTime(newTime);
      setCurrentGameTimeSecs(newTimeSecs);
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
        setDbUser(null);
        setTeamOptions([]);
        removeLocalGame();
      }
    })
    // unsubscribe to the listener when unmounting
    return () => unsubscribe()
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (user) {
      loadUser();
    }
  }, [user, loadUser]);

  // save game variables to localstorage to allow continuation of games on page reload
  useEffect(() => {
    localStorage.setItem('activePoint', activePoint);
    localStorage.setItem('activeTimeOut', activeTimeOut);
    localStorage.setItem('changingLineUp', changingLineUp);
    localStorage.setItem('currentGame', JSON.stringify(currentGame));
    localStorage.setItem('currentPoint', currentPoint);
    localStorage.setItem('currentPointLineUp', JSON.stringify(currentPointLineUp));
    localStorage.setItem('isOffence', isOffence);
    localStorage.setItem('prevEntry', JSON.stringify(prevEntry));
  }, [
    activePoint,
    activeTimeOut,
    changingLineUp,
    currentGame,
    currentPoint,
    currentPointLineUp,
    isOffence,
    prevEntry,
  ]);

  const removeLocalGame = () => {
    toast.dismiss();
    localStorage.removeItem('activePoint');
    localStorage.removeItem('activeTimeOut');
    localStorage.removeItem('currentGame');
    localStorage.removeItem('currentGameTime');
    localStorage.removeItem('currentPoint');
    localStorage.removeItem('curTimeSecs');
    localStorage.removeItem('prevLineUp');
    localStorage.setItem('timerPaused', 'true');
    // reset the state variables
    resetGame();
  }

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
    setLogOutWarning(false);
    setPrevEntry({});
    setChangingLineUp(false);
  }

  return (
    <Router>
      <ToastContainer
        autoClose={4000}
        draggable={false}
        hideProgressBar
        newestOnTop={false}
        position='top-right'
        transition={Slide}
      />
      {logOutWarning &&
        <LogOutModal
          firebaseApp={firebaseApp}
          setLogOutWarning={setLogOutWarning}
        />}
      <Header
        currentGame={currentGame}
        firebaseApp={firebaseApp}
        logOutWarning={logOutWarning}
        setLogOutWarning={setLogOutWarning}
        user={user}
      />
      <Switch>
        <Route path='/' exact>
          <Home
            currentGame={currentGame}
            firebaseApp={firebaseApp}
            uiConfig={uiConfig}
          />
          <OngoingGame
            currentGame={currentGame}
            pendingDel={pendingDel}
            removeLocalGame={removeLocalGame}
            resetGame={resetGame}
            setPendingDel={setPendingDel}
          />
        </Route>
        <Route path='/teams' exact>
          {localStorage.getItem('user') ?
            <>
              <Teams
                currentGame={currentGame}
                db={db}
                dbUser={dbUser}
                resetTeamOptions={resetTeamOptions}
                setDbUser={setDbUser}
              />
              <OngoingGame
                currentGame={currentGame}
                pendingDel={pendingDel}
                removeLocalGame={removeLocalGame}
                resetGame={resetGame}
                setPendingDel={setPendingDel}
              />
            </> : <Redirect to='/' />
          }
        </Route>
        <Route path='/games' exact>
          {localStorage.getItem('user') ?
            <>
              <Games
                currentGame={currentGame}
                fetchedGames={fetchedGames}
                db={db}
                dbUser={dbUser}
                lastGameDoc={lastGameDoc}
                setFetchedGames={setFetchedGames}
                setLastGameDoc={setLastGameDoc}
              />
              <OngoingGame
                currentGame={currentGame}
                pendingDel={pendingDel}
                removeLocalGame={removeLocalGame}
                resetGame={resetGame}
                setPendingDel={setPendingDel}
              />
            </> : <Redirect to='/' />
          }
        </Route>
        <Route path='/newgame' exact>
          {localStorage.getItem('user') ?
            <>
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
              <Stats
                activePoint={activePoint}
                activeTimeOut={activeTimeOut}
                changingLineUp={changingLineUp}
                currentGame={currentGame}
                currentGameTime={currentGameTime}
                currentGameTimeSecs={currentGameTimeSecs}
                currentPoint={currentPoint}
                currentPointLineUp={currentPointLineUp}
                fetchedGames={fetchedGames}
                gameTimer={gameTimer.current}
                db={db}
                dbUser={dbUser}
                isOffence={isOffence}
                prevEntry={prevEntry}
                removeLocalGame={removeLocalGame}
                setActivePoint={setActivePoint}
                setActiveTimeOut={setActiveTimeOut}
                setChangingLineUp={setChangingLineUp}
                setCurrentGame={setCurrentGame}
                setCurrentGameTime={setCurrentGameTime}
                setCurrentPoint={setCurrentPoint}
                setCurrentPointLineUp={setCurrentPointLineUp}
                setDbUser={setDbUser}
                setFetchedGames={setFetchedGames}
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
