import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { ToastContainer, cssTransition, toast } from 'react-toastify';
import Timer from 'easytimer.js';
import * as serviceWorker from './serviceWorker';

// Firebase
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// styles
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';
import './styles/Modal.css';
import './styles/Toast.css';

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
import ServiceWorkerToast from './Components/Toasts/ServiceWorkerToast';

const Slide = cssTransition({
  enter: 'toast-in',
  exit: 'toast-out',
  duration: [500, 100]
})

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SEND_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const uiConfig = {
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  credentialHelper: 'none',
  signInFlow: 'popup',
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false
  }
}

// Instantiate a Firebase app and database
const firebaseApp = firebase.initializeApp(firebaseConfig);
export const db = firebaseApp.firestore();
// enable the offline database capability
db.enablePersistence()
  .then(() => console.log('Offline Database Active'))
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.error('Multiple tabs open, persistence can only be enabled in one tab at a a time.', err)
    } else if (err.code === 'unimplemented') {
      console.error('The current browser does not support all of the features required to enable persistence', err)
    }
  })

function App() {

  // set state (global)
  const [activePoint, setActivePoint] = useState(localStorage.getItem('activePoint') === 'true');
  const [activeTimeOut, setActiveTimeOut] = useState(localStorage.getItem('activeTimeOut') === 'true');
  const [currentGame, setCurrentGame] = useState(JSON.parse(localStorage.getItem('currentGame')) || null);
  const [changingLineUp, setChangingLineUp] = useState(localStorage.getItem('changingLineUp') === 'true');
  const [confirmFinish, setConfirmFinish] = useState(false);
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
  const [gameStateHistory, setGameStateHistory] = useState(JSON.parse(localStorage.getItem('gameStateHistory')) || []);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600 ? true : false);
  const [isOffence, setIsOffence] = useState(localStorage.getItem('isOffence') === 'true');
  const [lastGameDoc, setLastGameDoc] = useState(null);
  const [logOutWarning, setLogOutWarning] = useState(false);
  const [pendingDel, setPendingDel] = useState(false);
  const [prevEntry, setPrevEntry] = useState(JSON.parse(localStorage.getItem('prevEntry')) || {});
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [serviceWorkerInit, setServiceWorkerInit] = useState(false);
  const [serviceWorkerReg, setServiceWorkerReg] = useState(null);
  const [teamOptions, setTeamOptions] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.register({
    onSuccess: () => setServiceWorkerInit(true),
    onUpdate: reg => {
      setServiceWorkerReg(reg);
    },
  });

  // show service worker toast on first install
  useEffect(() => {
    if (serviceWorkerInit) {
      toast.success('App available for offline use.')
    }
  }, [serviceWorkerInit]);

  // allow user to update site when service worker changes and no active game
  useEffect(() => {
    if (!currentGame && serviceWorkerReg && serviceWorkerReg.waiting) {
      toast.info(
        <ServiceWorkerToast
          serviceWorkerReg={serviceWorkerReg}
        />,
        {
          closeOnClick: false,
          autoClose: false
        }
      );
    }
  }, [currentGame, serviceWorkerReg])

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
    // show toast for successful update
    if (localStorage.getItem('serviceWorkerUpdated') === 'true') {
      toast.success('Site Updated');
      localStorage.setItem('serviceWorkerUpdated', 'false');
    }
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
    localStorage.setItem('gameStateHistory', JSON.stringify(gameStateHistory))
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
    gameStateHistory,
    isOffence,
    prevEntry,
  ]);

  const finishGame = () => {
    let newGame = { ...currentGame };
    newGame.endTime = currentGameTime;
    newGame.endTimeSecs = currentGameTimeSecs;
    if (activePoint) {
      let lastPoint = Object.keys(newGame.pointHistory).pop();
      newGame.pointHistory[lastPoint].end = currentGameTimeSecs;
      newGame.pointHistory[lastPoint].scored = false;
    }
    dbUtils.saveGame(newGame);
    let newGameList = fetchedGames ? [...fetchedGames] : [];
    newGameList.unshift(newGame);
    setFetchedGames(newGameList);
    removeLocalGame();
    setConfirmFinish(false);
  }

  const removeLocalGame = () => {
    toast.dismiss();
    localStorage.removeItem('activePoint');
    localStorage.removeItem('activeTimeOut');
    localStorage.removeItem('currentGame');
    localStorage.removeItem('currentGameTime');
    localStorage.removeItem('currentPoint');
    localStorage.removeItem('curTimeSecs');
    localStorage.removeItem('gameStateHistory');
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
    setGameStateHistory([]);
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
        transition={Slide}
      />
      {logOutWarning &&
        <LogOutModal
          firebaseApp={firebaseApp}
          setLogOutWarning={setLogOutWarning}
        />}
      {confirmFinish &&
        <FinishGameModal
          finishGame={finishGame}
          setConfirmFinish={setConfirmFinish}
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
                dbUser={dbUser}
                finishGame={finishGame}
                gameStateHistory={gameStateHistory}
                gameTimer={gameTimer.current}
                isOffence={isOffence}
                prevEntry={prevEntry}
                setActivePoint={setActivePoint}
                setActiveTimeOut={setActiveTimeOut}
                setChangingLineUp={setChangingLineUp}
                setConfirmFinish={setConfirmFinish}
                setCurrentGame={setCurrentGame}
                setCurrentGameTime={setCurrentGameTime}
                setCurrentPoint={setCurrentPoint}
                setCurrentPointLineUp={setCurrentPointLineUp}
                setDbUser={setDbUser}
                setFetchedGames={setFetchedGames}
                setGameStateHistory={setGameStateHistory}
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
