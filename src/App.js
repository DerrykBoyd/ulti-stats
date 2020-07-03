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
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';
import './styles/Modal.css';

// Components
import FinishGameModal from './Components/FinishGameModal';
import GameDetails from './Components/GameDetails';
import Games from './Components/Games';
import Header from './Components/Header';
import Home from './Components/Home';
import LogOutModal from './Components/LogOutModal';
import NewGame from './Components/NewGame';
import OngoingGame from './Components/OngoingGame';
import Stats from './Components/Stats';
import Team from './Components/Team';
import Teams from './Components/Teams';

// helper functions
import * as dbUtils from './Utils/dbUtils';
import Profile from './Components/Profile';

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
  credentialHelper: 'none',
  signInFlow: 'redirect',
  signInSuccessUrl: '/',
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
  const [confirmDel, setConfirmDel] = useState(false);
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
    gameFormat: '7',
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600 ? true : false);
  const [isOffence, setIsOffence] = useState(localStorage.getItem('isOffence') === 'true');
  const [lastGameDoc, setLastGameDoc] = useState(null);
  const [logOutWarning, setLogOutWarning] = useState(false);
  const [pendingDel, setPendingDel] = useState(false);
  const [prevEntry, setPrevEntry] = useState(JSON.parse(localStorage.getItem('prevEntry')) || {});
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [teamOptions, setTeamOptions] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

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

  function updateIsMobile() {
    setIsMobile(window.innerWidth <= 600);
  }

  // update isMobile on window resize
  useEffect(() => {
    window.addEventListener('resize', updateIsMobile);

    return () => window.removeEventListener('resize', updateIsMobile);
  })

  const loadUser = useCallback(() => {
    // get user from localStorage if loaded already
    if (localStorage.getItem('dbUser') !== 'null') {
      return
    }
    // get the user from the db and load into state
    // add the user to the database if doesn't exist
    db.collection('users').doc(user.uid)
      .get()
      .then(doc => {
        if (doc.exists) {
          let newDbUser = doc.data();
          setDbUser(newDbUser);
          console.log('User fetched from database')
        } else {
          let newDbUser = {
            creationTime: user.metadata.creationTime,
            email: user.email,
            name: user.displayName || '',
            opponents: [],
            profileURL: user.photoURL || 'https://firebasestorage.googleapis.com/v0/b/ultimate-stats-3bdf2.appspot.com/o/default-profiles%2F050-rapper.png?alt=media',
            teams: {},
            uid: user.uid,
          }
          db.collection('users').doc(user.uid)
            .set(newDbUser);
          setDbUser(newDbUser)
        }
      })
      .catch(error => console.error('Error loading User', error))
  }, [user]);

  // listen for realtime updates to dbUser if loaded
  useEffect(() => {
    let updateUser = null;
    if (user) {
      console.log('Adding snapshot listener')
      updateUser = db.collection('users').doc(user.uid)
        .onSnapshot((doc) => {
          console.log('firestore snapshot read')
          setDbUser(doc.data())
        })
    }
    return () => {
      if (updateUser !== null) {
        console.log('Removing snapshot listener')
        updateUser();
      }
    }
  }, [user])

  useEffect(() => {
    // listen for auth state changes
    const unsubscribe = firebaseApp.auth().onAuthStateChanged(user => {
      if (user) {
        // user signed in
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('dbUser');
        setUser(user);
        setDbUser(null);
        setFetchedGames([]);
        setTeamOptions([]);
        setProfileMenuOpen(false);
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
    localStorage.setItem('dbUser', JSON.stringify(dbUser));
    localStorage.setItem('isOffence', isOffence);
    localStorage.setItem('prevEntry', JSON.stringify(prevEntry));
  }, [
    activePoint,
    activeTimeOut,
    changingLineUp,
    currentGame,
    currentPoint,
    currentPointLineUp,
    dbUser,
    isOffence,
    prevEntry,
  ]);

  const finishGame = () => {
    let newGame = { ...currentGame };
    dbUtils.saveGame(newGame);
    if (fetchedGames && fetchedGames.length) {
      let newGameList = [...fetchedGames];
      newGameList.unshift(newGame);
      setFetchedGames(newGameList);
    }
    removeLocalGame();
    setConfirmDel(false);
  }

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
      {confirmDel &&
        <FinishGameModal
          finishGame={finishGame}
          setConfirmDel={setConfirmDel}
        />}
      <Header
        currentGame={currentGame}
        dbUser={dbUser}
        firebaseApp={firebaseApp}
        logOutWarning={logOutWarning}
        profileMenuOpen={profileMenuOpen}
        setLogOutWarning={setLogOutWarning}
        setProfileMenuOpen={setProfileMenuOpen}
      />
      <Switch>
        <Route path='/' exact>
          <Home
            currentGame={currentGame}
            firebaseApp={firebaseApp}
            isMobile={isMobile}
            title='Home'
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
                setDbUser={setDbUser}
                title='Teams'
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
        <Route path='/teams/:teamID'>
          {localStorage.getItem('user') ?
            <>
              <Team
                currentGame={currentGame}
                db={db}
                dbUser={dbUser}
                setDbUser={setDbUser}
                title='Edit Team'
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
                title='Games'
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
        <Route path='/games/:gameID'>
          {localStorage.getItem('user') ?
            <>
              <GameDetails
                currentGame={currentGame}
                dbUser={dbUser}
                fetchedGames={fetchedGames}
                isMobile={isMobile}
                title='Game Details'
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
                title='New Game'
              />
            </> : <Redirect to='/' />
          }
        </Route>
        <Route path='/profile' exact>
          {localStorage.getItem('user') ?
            <Profile
              dbUser={dbUser}
              setDbUser={setDbUser}
              user={user}
            /> :
            <Redirect to='/' />
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
                finishGame={finishGame}
                gameTimer={gameTimer.current}
                db={db}
                dbUser={dbUser}
                isOffence={isOffence}
                prevEntry={prevEntry}
                removeLocalGame={removeLocalGame}
                setActivePoint={setActivePoint}
                setActiveTimeOut={setActiveTimeOut}
                setChangingLineUp={setChangingLineUp}
                setConfirmDel={setConfirmDel}
                setCurrentGame={setCurrentGame}
                setCurrentGameTime={setCurrentGameTime}
                setCurrentPoint={setCurrentPoint}
                setCurrentPointLineUp={setCurrentPointLineUp}
                setDbUser={setDbUser}
                setFetchedGames={setFetchedGames}
                setIsOffence={setIsOffence}
                setPrevEntry={setPrevEntry}
                title='Stats'
              />
            </> : <Redirect to='/newgame' />
          }
        </Route>
        <Route>
          <Redirect to='/' />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
