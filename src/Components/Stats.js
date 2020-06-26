import React, { useState, useEffect } from 'react';
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';

import { sortByName, sortOrderOptions } from '../Utils/utils';
import * as db from '../Utils/db';

import AddPlayerForm from './AddPlayerForm';
import Scoreboard from './Scoreboard';

import '../styles/Stats.css';
import RosterList from './RosterList';
import StatPlayerList from './StatPlayerList';
import TimeOutModal from './TimeOutModal';

export default function Stats(props) {

  const activePoint = props.activePoint;
  const activeTimeOut = props.activeTimeOut;
  const currentGame = props.currentGame;
  const currentEditTeam = props.currentGame.teamID;
  const currentPoint = props.currentPoint;
  const dbUser = props.dbUser;
  const isOffence = props.isOffence;
  const lineUp = props.currentPointLineUp;
  const prevEntry = props.prevEntry;
  const setCurrentPointLineUp = props.setCurrentPointLineUp;
  const timer = props.gameTimer;
  const timeStr = props.currentGameTime || '00:00';
  const timeSecs = props.currentGameTimeSecs || 0;

  const rsStyles = {
    container: (provided) => ({
      ...provided,
      'minWidth': '140px',
    })
  }

  // set state
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [teamRoster, setTeamRoster] = useState([]);
  const [timerPaused, setTimerPaused] = useState(localStorage.getItem('timerPaused') === 'true');

  let history = useHistory();

  useEffect(() => {
    localStorage.setItem('timerPaused', timerPaused);
    if (!timerPaused) {
      timer.start({
        startValues: {
          minutes: parseInt(timeStr.split(':')[0]),
          seconds: parseInt(timeStr.split(':')[1]),
        }
      });
    }
  }, [timerPaused, timeStr, timer])

  // update state when user data updated
  useEffect(() => {
    if (dbUser) {
      let teamData = Object.values(dbUser.teams).find((team) => {
        return team.teamID === currentGame.teamID;
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
  }, [dbUser, currentGame])

  const addHistoryEntry = (action, player = {}, turnover = false) => {
    // remove any active toast messages
    toast.dismiss();
    // start timer if not started already
    startTimer();
    // make copy of the current game for updating
    let newCurGame = { ...currentGame };
    // set the last two entries for Assists and validations
    let lastEntry = newCurGame.gameHistory[newCurGame.gameHistory.length - 1] || '';
    let secLastEntry = newCurGame.gameHistory[newCurGame.gameHistory.length - 2] || '';
    // Validate first action of a possession is a touch
    if (isOffence && action !== 'touch' && (lastEntry.turnover || !newCurGame.gameHistory.length)) {
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
        console.log(lastEntry.player)
        toast.error(`Only player in possession can throwaway`);
        return;
      }
    }
    // set the score for points
    if (action === 'point') {
      newCurGame.score[newCurGame.teamName]++;
      newCurGame = finishPoint(true, newCurGame);
      localStorage.setItem('prevLineUp', JSON.stringify(props.currentPointLineUp));
    }
    if (action === 'oppPoint') {
      newCurGame.score[newCurGame.opponent]++;
      newCurGame = finishPoint(false, newCurGame);
      localStorage.setItem('prevLineUp', JSON.stringify(props.currentPointLineUp));
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
    // update the playerStats
    if (player.playerID) {
      // add stat from button click
      newCurGame.playerStats[player.playerID][action]++;
      // add a touch for a drop
      if (action === 'drop') newCurGame.playerStats[player.playerID].touch++;
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
    if (turnover) props.setIsOffence(!isOffence);
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
    let newCurGame = { ...currentGame };
    newCurGame.timerHistory.push(entry);
    props.setCurrentGame(newCurGame);
  }

  const finishPoint = (scored, game) => {
    // start timer if not started already
    startTimer();
    // finish point when point scored
    game.pointHistory[currentPoint].end = timeSecs;
    game.pointHistory[currentPoint].scored = scored;
    props.setActivePoint(false);
    let newCurPoint = props.currentPoint;
    newCurPoint++;
    props.setCurrentPoint(newCurPoint);
    toggleAllOff();
    return game;
  }

  const undoFinishPoint = (game) => {
    // decrement the current point
    let newCurPoint = props.currentPoint;
    newCurPoint--;
    game.pointHistory[newCurPoint].end = '';
    game.pointHistory[newCurPoint].scored = '';
    props.setActivePoint(true);
    props.setCurrentPoint(newCurPoint);
    return game;
  }

  const finishGame = () => {
    db.saveGame({...currentGame});
    props.removeLocalGame();
    history.push('/');
  }

  const handleSortChange = (newValue) => {
    let newDbUser = { ...dbUser };
    newDbUser.teams[currentEditTeam].playerSortOrder = newValue.value;
    props.setDbUser(newDbUser);
  }

  const startPoint = () => {
    // start timer if not started already
    startTimer();
    // start point when roster confirmed (pull released)
    let newCurGame = { ...currentGame };
    //check size of currentGame Object - REMOVE
    console.log(JSON.stringify(newCurGame).length);
    // set active point to true
    props.setActivePoint(true);
    // record start of point in game history
    newCurGame.pointHistory[currentPoint] = {
      start: timeSecs,
      isOffence: props.isOffence,
    }
    for (let player of lineUp) {
      newCurGame.playerStats[player.playerID].pointsPlayed.push(currentPoint);
    }
    // set new state
    props.setCurrentGame(newCurGame);
    props.setChangingLineUp(false);
  }

  const startTimer = () => {
    // start timer if not started already
    if (timerPaused) {
      timer.start({
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
    let newGame = { ...currentGame };
    let ind = newGame.timeOuts[teamName].length - 1;
    newGame.timeOuts[teamName][ind].endTime = timeSecs;
  }

  const timeOutStart = (teamName) => {
    let newGame = { ...currentGame };
    newGame.timeOuts[teamName].push({
      startTime: timeSecs,
    })
  }

  const toggleAllOff = () => {
    let newRoster = [...teamRoster];
    setTeamRoster(newRoster);
    setCurrentPointLineUp([]);
  }

  const togglePlayer = (player, selected) => {
    let newPointLineUp = [...lineUp];
    // add or remove from pointLineUp
    if (selected) {
      // remove from newPointLineup if deselected
      let ind = newPointLineUp.findIndex(el => el.playerID === player.playerID);
      newPointLineUp.splice(ind, 1);
    } else {
      // add to newPointLineUp if not already included
      if (!newPointLineUp.find(el => el.playerID === player.playerID)) newPointLineUp.push(player);
    }
    setCurrentPointLineUp(newPointLineUp);
  }

  const undoAction = () => {
    toast.dismiss();
    let newGame = { ...currentGame };
    // remove last entry from gameHistory
    let undoEntry = newGame.gameHistory.pop();
    if (!undoEntry) {
      toast.info('Nothing to undo');
      return;
    }
    // undo the playerStats counts
    if (undoEntry.playerID) {
      // remove last action
      newGame.playerStats[undoEntry.playerID][undoEntry.action]--;
      // remove extra touch for drop
      if (undoEntry.action === 'drop' || undoEntry.action === 'point') {
        newGame.playerStats[undoEntry.playerID].touch--;
      };
      // remove assist for point
      if (undoEntry.action === 'point') {
        newGame.playerStats[undoEntry.assistID].assist--;
        newGame.score[newGame.teamName]--;
        newGame = undoFinishPoint(newGame);
        setCurrentPointLineUp(JSON.parse(localStorage.getItem('prevLineUp')));
      }
    }
    if (undoEntry.action === 'oppPoint') {
      newGame.score[newGame.opponent]--;
      newGame = undoFinishPoint(newGame);
      setCurrentPointLineUp(JSON.parse(localStorage.getItem('prevLineUp')));
    }
    // toggle offence for turnover
    if (undoEntry.turnover) {
      props.setIsOffence(!isOffence);
    }
    toast.info(`UNDO: ${undoEntry.action}`);
    // set the prevEntry for button state
    if (!newGame.gameHistory.length) props.setPrevEntry({ action: '', playerID: '', turnover: false });
    else {
      let newPrevEntry = newGame.gameHistory[newGame.gameHistory.length - 1];
      props.setPrevEntry({
        action: newPrevEntry.action,
        playerID: newPrevEntry.playerID,
        turnover: newPrevEntry.turnover,
      })
    }
    // update the game in state
    props.setCurrentGame(newGame);
  }

  return (
    <div className='App teams-main'>
      {activeTimeOut &&
        <TimeOutModal
          currentGame={currentGame}
          setActiveTimeOut={props.setActiveTimeOut}
          startTimer={startTimer}
          timeOutEnd={timeOutEnd}
          timeOutStart={timeOutStart}
          timeSecs={timeSecs}
        />
      }
      <Scoreboard
        activeTimeOut={activeTimeOut}
        addTimerEntry={addTimerEntry}
        currentGame={currentGame}
        currentGameTime={props.currentGameTime}
        finishGame={finishGame}
        gameTimer={props.gameTimer}
        setActiveTimeOut={props.setActiveTimeOut}
        setCurrentGame={props.setCurrentGame}
        setCurrentGameTime={props.setCurrentGameTime}
        setTimerPaused={setTimerPaused}
        timerPaused={timerPaused}
        undoAction={undoAction}
      />
      {/* Component for choosing lineup at start of point */}
      {!activePoint ?
        <>
          <div className='roster-list-header'>
            {lineUp.length === currentGame.gameFormat.value ?
              <button
                className='btn btn-green'
                onClick={startPoint}
              >{props.changingLineUp ? `Resume Point` : `Start Point`}</button>
              :
              <h3>{`${lineUp.length} out of ${currentGame.gameFormat.value} players selected for ${props.isOffence ? 'Offence' : 'Defence'}`}</h3>
            }
          </div>
          <RosterList
            lineUp={lineUp}
            teamRoster={teamRoster}
            togglePlayer={togglePlayer}
          />
          <form>
            {showAddPlayer ?
              <AddPlayerForm
                currentEditTeam={currentEditTeam}
                currentGame={currentGame}
                dbUser={dbUser}
                saveToDb={true}
                setCurrentGame={props.setCurrentGame}
                setDbUser={props.setDbUser}
                setShowAddPlayer={setShowAddPlayer}
              />
              :
              <div className='player-list-options'>
                <button className='btn' onClick={() => setShowAddPlayer(true)}>Add Player</button>
                <div className='sort-select'>
                  <span>Sort</span>
                  {dbUser && currentEditTeam &&
                    <Select
                      defaultValue={{
                        value: dbUser.teams[currentEditTeam].playerSortOrder,
                        label: dbUser.teams[currentEditTeam].playerSortOrder,
                      }}
                      isSearchable={false}
                      onChange={handleSortChange}
                      options={sortOrderOptions}
                      styles={rsStyles}
                    />
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
          {!isOffence &&
            <div className='btn-container'>
              <button className='btn' onClick={() => {
                addHistoryEntry('oppPoint', {}, true);
              }}
              >Opposition Score</button>
              <button className='btn' onClick={() => {
                addHistoryEntry('oppTurnOver', {}, true);
              }}
              >Opposition Turnover</button>
            </div>
          }

          <StatPlayerList
            activePlayers={lineUp}
            addHistoryEntry={addHistoryEntry}
            offence={props.isOffence}
            playerStats={Object.values(currentGame.playerStats)}
            prevEntry={prevEntry}
            timerPaused={timerPaused}
            timeStr={timeStr}
            setTimerPaused={setTimerPaused}
          />
          <button
            className='btn'
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
