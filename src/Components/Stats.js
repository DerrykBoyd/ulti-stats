import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { sortByName } from '../Utils/utils';

import AddPlayerForm from './AddPlayerForm';
import GameOptions from './GameOptions';

import '../styles/Stats.css';
import RosterList from './RosterList';
import StatPlayerList from './StatPlayerList';
import TimeOutModal from './TimeOutModal';

export default function Stats(props) {

  // set the page title
  useEffect(() => {
    document.title = `Ultimate Stats - ${props.title}`
  }, [props.title])

  const timeStr = props.currentGameTime || '00:00';
  const timeSecs = props.currentGameTimeSecs || 0;

  // set state
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [teamRoster, setTeamRoster] = useState([]);
  const [timerPaused, setTimerPaused] = useState(localStorage.getItem('timerPaused') === 'true');

  useEffect(() => {
    localStorage.setItem('timerPaused', timerPaused);
    if (!timerPaused) {
      props.gameTimer.start({
        startValues: {
          minutes: parseInt(timeStr.split(':')[0]),
          seconds: parseInt(timeStr.split(':')[1]),
        }
      });
    }
  }, [timerPaused, timeStr, props.gameTimer])

  // update state when user data updated
  useEffect(() => {
    if (props.dbUser) {
      let teamData = Object.values(props.dbUser.teams).find((team) => {
        return team.teamID === props.currentGame.teamID;
      });
      localStorage.setItem('currentSort', teamData.playerSortOrder);
      let newTeamRoster = Object.values(teamData.players);
      newTeamRoster.sort((a, b) => {
        switch (teamData.playerSortOrder) {
          case 'Number':
            return a.number - b.number
          case 'First Name':
            return sortByName(a.firstName, b.firstName)
          case 'Last Name':
            return sortByName(a.lastName, b.lastName)
          default:
            return a.number - b.number
        }
      })
      setTeamRoster(newTeamRoster);
    }
  }, [props.dbUser, props.currentGame])

  function generateHistoryEntry() {
    let histEntry = {};
    histEntry.currentGame = JSON.stringify(props.currentGame);
    histEntry.currentPoint = props.currentPoint;
    histEntry.currentPointLineUp = [...props.currentPointLineUp];
    histEntry.isOffence = props.isOffence;
    histEntry.pointTouches = props.pointTouches;
    histEntry.prevEntry = props.prevEntry;

    return histEntry;
  }

  const addHistoryEntry = (action, player = {}, turnover = false) => {

    // remove any active toast messages
    toast.dismiss();
    // start timer if not started already
    startTimer();

    // add an entry to the gameStateHistory for undo
    let stateHistoryEntry = generateHistoryEntry();
    let newGameStateHistory = [...props.gameStateHistory];
    newGameStateHistory.push(stateHistoryEntry);
    props.setGameStateHistory(newGameStateHistory);

    let newCurGame = { ...props.currentGame };
    // set the last two entries for Assists and validations
    let lastEntry = newCurGame.gameHistory[newCurGame.gameHistory.length - 1] || '';
    let secLastEntry = newCurGame.gameHistory[newCurGame.gameHistory.length - 2] || '';
    // Validate first action of a possession is a touch
    if (props.isOffence && action !== 'touch' && (lastEntry.turnover || !newCurGame.gameHistory.length)) {
      toast.error('First action of a possession must be a touch');
      return;
    }
    // Validate cannot touch twice in a row
    if (action === 'touch' && lastEntry.playerID === player.playerID && !lastEntry.turnover) {
      toast.error('Cannot touch the disc twice in a row');
      return;
    }
    // Validate cannot drop own throw
    if (action === 'drop' && lastEntry.playerID === player.playerID) {
      toast.error('Cannot drop own throw');
      return;
    }
    // Validate throwaway was by lastPlayer
    if (action === 'throwAway') {
      if (lastEntry.action !== 'touch') {
        toast.error('Throwaway can only be recorded following a touch');
        return;
      } else if (lastEntry.playerID !== player.playerID) {
        toast.error(`Only player in possession can throwaway`);
        return;
      }
    }
    // set the score for points
    if (action === 'point') {
      newCurGame.score[newCurGame.teamName]++;
      newCurGame = finishPoint(true, newCurGame);
    }
    if (action === 'oppPoint') {
      newCurGame.score[newCurGame.opponent]++;
      newCurGame = finishPoint(false, newCurGame);
    }
    // create a new historyEntry
    let entry = {
      timeStamp: Date.now(),
      gameTime: props.currentGameTime,
      gameTimeSecs: timeSecs,
      action: action,
      [`${newCurGame.teamName}_score`]: newCurGame.score[newCurGame.teamName],
      [`${newCurGame.opponent}_score`]: newCurGame.score[newCurGame.opponent],
      turnover: turnover,
    }
    if (player.playerID) {
      entry.playerID = player.playerID;
      entry.playerName = `${player.firstName} ${player.lastName}`;
      entry.playerNum = `${player.number}`;
      if (action === 'point') entry.assistID = lastEntry.playerID;
    }
    newCurGame.gameHistory.push(entry);
    if (action === 'touch') {
      let newTouches = parseInt(props.pointTouches) + 1;
      props.setPointTouches(newTouches);
    }
    // update the playerStats
    if (player.playerID) {
      // add stat from button click
      newCurGame.playerStats[player.playerID][action]++;
      // add a touch for a drop
      if (action === 'drop') {
        newCurGame.playerStats[player.playerID].touch++;
        let newTouches = parseInt(props.pointTouches) + 1;
        props.setPointTouches(newTouches);
      }
      // add touch for a point if not added by user
      if (action === 'point' && lastEntry.playerID !== player.playerID) {
        newCurGame.playerStats[player.playerID].touch++;
      }
      // give assist to lastPlayer or player for callahan goal
      if (action === 'point' && (lastEntry.playerID !== player.playerID ||
        (secLastEntry.turnover || !secLastEntry))) newCurGame.playerStats[lastEntry.playerID].assist++;
      // give assist to secondLast player in case of user pressing touch before point
      else if (action === 'point' && lastEntry.playerID === player.playerID) {
        newCurGame.playerStats[secLastEntry.playerID].assist++;
      }
    }
    // log entry to console
    console.log(`${player.playerID ? `#${player.number}: ` : ''}${action}: time: ${timeSecs} seconds`);
    toast.success(`Last Entry: ${action} ${player.playerID ? '- #' + player.number : ''}`)
    props.setPrevEntry({ action: action, playerID: player.playerID, turnover: turnover });
    if (turnover) props.setIsOffence(!props.isOffence);
    // set new state
    props.setCurrentGame(newCurGame);
  }

  const addTimerEntry = (action) => {
    // create a new timerEntry
    let entry = {
      timeStamp: Date.now(),
      gameTime: props.currentGameTime,
      action: action,
    }
    let newCurGame = { ...props.currentGame };
    newCurGame.timerHistory.push(entry);
    props.setCurrentGame(newCurGame);
  }

  const finishPoint = (scored, game) => {
    // start timer if not started already
    startTimer();
    // finish point when point scored
    game.pointHistory[props.currentPoint].end = timeSecs;
    game.pointHistory[props.currentPoint].scored = scored;
    game.pointHistory[props.currentPoint].touches = parseInt(props.pointTouches) + 1;
    props.setActivePoint(false);
    props.setPointTouches(0);
    let newCurPoint = props.currentPoint;
    newCurPoint++;
    props.setCurrentPoint(newCurPoint);
    toggleAllOff();
    return game;
  }

  const handleSortChange = (e) => {
    let newDbUser = { ...props.dbUser };
    newDbUser.teams[props.currentEditTeam].playerSortOrder = e.target.value;
    props.setDbUser(newDbUser);
  }

  const startPoint = () => {
    // start timer if not started already
    startTimer();
    // start point when roster confirmed (pull released)
    let newCurGame = { ...props.currentGame };
    // set active point to true
    props.setActivePoint(true);
    // record start of point in game history
    newCurGame.pointHistory[props.currentPoint] = {
      start: timeSecs,
      isOffence: props.isOffence,
    }
    for (let player of props.currentPointLineUp) {
      newCurGame.playerStats[player.playerID].pointsPlayed.push(props.currentPoint);
    }
    // set new state
    props.setCurrentGame(newCurGame);
    props.setChangingLineUp(false);
  }

  const startTimer = () => {
    // start timer if not started already
    if (timerPaused) {
      props.gameTimer.start({
        startValues: {
          minutes: parseInt(timeStr.split(':')[0]),
          seconds: parseInt(timeStr.split(':')[1]),
        }
      });
      setTimerPaused(false);
      addTimerEntry('timer-started');
    }
  }

  const timeOutEnd = (teamName) => {
    let newGame = { ...props.currentGame };
    let ind = newGame.timeOuts[teamName].length - 1;
    newGame.timeOuts[teamName][ind].endTime = timeSecs;
  }

  const timeOutStart = (teamName) => {
    let newGame = { ...props.currentGame };
    newGame.timeOuts[teamName].push({
      startTime: timeSecs,
    })
  }

  const toggleAllOff = () => {
    let newRoster = [...teamRoster];
    setTeamRoster(newRoster);
    props.setCurrentPointLineUp([]);
  }

  const togglePlayer = (player, selected) => {
    let newPointLineUp = [...props.currentPointLineUp];
    // add or remove from pointLineUp
    if (selected) {
      // remove from newPointLineup if deselected
      let ind = newPointLineUp.findIndex(el => el.playerID === player.playerID);
      newPointLineUp.splice(ind, 1);
    } else {
      // add to newPointLineUp if not already included
      if (!newPointLineUp.find(el => el.playerID === player.playerID)) newPointLineUp.push(player);
    }
    props.setCurrentPointLineUp(newPointLineUp);
  }

  const undoAction = () => {
    toast.dismiss();
    // get the last state from the state history
    let newStateHistory = [...props.gameStateHistory];
    let lastState = newStateHistory.pop();
    // do nothing if noting to undo
    if (!lastState) {
      toast.info('Nothing to undo');
      return;
    }
    // show user undo toast
    let undoEntry = { ...props.currentGame }.gameHistory.pop();
    toast.info(`UNDO: ${undoEntry.action} ${undoEntry.playerNum ? `by #${undoEntry.playerNum}` : ''}`);
    // process undo state change
    props.setActivePoint(true);
    props.setCurrentGame(JSON.parse(lastState.currentGame));
    props.setCurrentPoint(lastState.currentPoint)
    props.setCurrentPointLineUp(lastState.currentPointLineUp);
    props.setIsOffence(lastState.isOffence);
    props.setPointTouches(lastState.pointTouches);
    props.setPrevEntry(lastState.prevEntry);
    props.setGameStateHistory(newStateHistory);
  }

  return (
    <div className='App App-flex'>
      {props.activeTimeOut &&
        <TimeOutModal
          currentGame={props.currentGame}
          setActiveTimeOut={props.setActiveTimeOut}
          startTimer={startTimer}
          timeOutEnd={timeOutEnd}
          timeOutStart={timeOutStart}
          timeSecs={timeSecs}
        />
      }
      <GameOptions
        activeTimeOut={props.activeTimeOut}
        addTimerEntry={addTimerEntry}
        currentGame={props.currentGame}
        currentGameTime={props.currentGameTime}
        finishGame={props.finishGame}
        gameTimer={props.gameTimer}
        setActiveTimeOut={props.setActiveTimeOut}
        setConfirmFinish={props.setConfirmFinish}
        setCurrentGame={props.setCurrentGame}
        setCurrentGameTime={props.setCurrentGameTime}
        setTimerPaused={setTimerPaused}
        timerPaused={timerPaused}
        undoAction={undoAction}
      />
      {/* Component for choosing lineup at start of point */}
      {!props.activePoint ?
        <>
          <div className='roster-list-header'>
            {props.currentPointLineUp.length === props.currentGame.gameFormat ?
              <button
                className='btn btn-green'
                onClick={startPoint}
              >{props.changingLineUp ? `Resume Point` : `Start Point`}</button>
              :
              <h3>{`${props.currentPointLineUp.length} out of ${props.currentGame.gameFormat} players selected for ${props.isOffence ? 'Offence' : 'Defence'}`}</h3>
            }
          </div>
          <RosterList
            lineUp={props.currentPointLineUp}
            teamRoster={teamRoster}
            togglePlayer={togglePlayer}
          />
          <form>
            {showAddPlayer ?
              <AddPlayerForm
                currentEditTeam={props.currentEditTeam}
                currentGame={props.currentGame}
                dbUser={props.dbUser}
                saveToDb={true}
                setCurrentGame={props.setCurrentGame}
                setDbUser={props.setDbUser}
                setShowAddPlayer={setShowAddPlayer}
              />
              :
              <div className='player-list-options'>
                <button className='btn btn-primary' onClick={() => setShowAddPlayer(true)}>Add Player</button>
                <div className='sort-select'>
                  {props.dbUser && props.currentEditTeam &&
                    <>
                      <span>Sort</span>
                      <select
                        name='sort-select'
                        value={props.dbUser.teams[props.currentEditTeam].playerSortOrder}
                        onChange={handleSortChange}
                      >
                        <option value='Number'>Number</option>
                        <option value='First Name'>First Name</option>
                        <option value='Last Name'>Last Name</option>
                      </select>
                    </>
                  }
                </div>
              </div>
            }
          </form>
        </>
        :
        // Take stats when there is an active point.
        <>
          {/* btn to record opposition point */}
          {!props.isOffence &&
            <div className='btn-container'>
              <button className='btn' onClick={() => {
                addHistoryEntry('oppPoint', {}, true);
              }}
              >Opposition Point</button>
              <button className='btn' onClick={() => {
                addHistoryEntry('oppTurnOver', {}, true);
              }}
              >Opposition Turnover</button>
            </div>
          }

          <StatPlayerList
            activePlayers={props.currentPointLineUp}
            addHistoryEntry={addHistoryEntry}
            offence={props.isOffence}
            playerStats={Object.values(props.currentGame.playerStats)}
            prevEntry={props.prevEntry}
            timerPaused={timerPaused}
            timeStr={timeStr}
            setTimerPaused={setTimerPaused}
          />
          <button
            className='btn btn-primary'
            onClick={() => {
              props.setActivePoint(false);
              props.setChangingLineUp(true);
            }}
          >Change Lineup</button>
        </>
      }
    </div >
  )
}
