import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';

import { sortByName, sortOrderOptions } from '../Utils/utils';

import AddPlayerForm from './AddPlayerForm';
import Scoreboard from './Scoreboard';

import '../styles/Stats.css';
import RosterList from './RosterList';
import StatPlayerList from './StatPlayerList';

export default function Stats(props) {

  let currentGame = props.currentGame;
  let currentEditTeam = props.currentGame.teamID;
  let currentPoint = props.currentPoint;
  let dbUser = props.dbUser;
  let gameTimer = props.gameTimer;
  let isOffence = props.isOffence;
  let lineUp = props.currentPointLineUp;
  let prevEntry = props.prevEntry;
  let timer = props.gameTimer;
  let timeStr = props.currentGameTime || '00:00';

  const rsStyles = {
    container: (provided) => ({
      ...provided,
      'minWidth': '140px',
    })
  }

  // set state
  const [teamRoster, setTeamRoster] = useState(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [timerPaused, setTimerPaused] = useState(true);

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
    let gameTimeSecs = gameTimer.getTotalTimeValues().seconds;
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
      finishPoint(true);
    }
    if (action === 'oppPoint') {
      newCurGame.score[newCurGame.opponent]++;
      finishPoint(false);
    }
    // create a new historyEntry
    let entry = {
      timeStamp: Date.now(),
      gameTime: props.currentGameTime,
      gameTimeSecs: gameTimeSecs,
      action: action,
      [`${newCurGame.teamName}_score`]: newCurGame.score[newCurGame.teamName],
      [`${newCurGame.opponent}_score`]: newCurGame.score[newCurGame.opponent],
      turnover: turnover,
    }
    if (player.playerID) {
      entry.playerID = player.playerID;
      entry.playerName = `${player.firstName} ${player.lastName}`;
      entry.playerNum = `${player.number}`;
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
    console.log(`${player.playerID ? `#${player.number}` : ''}: ${action}: time: ${gameTimeSecs} seconds`);
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

  const finishPoint = (scored) => {
    // start timer if not started already
    startTimer();
    // TODO finish point when point scored
    let gameTimeSecs = gameTimer.getTotalTimeValues().seconds;
    let newCurGame = { ...currentGame };
    newCurGame.pointHistory[currentPoint].end = gameTimeSecs;
    newCurGame.pointHistory[currentPoint].scored = scored;
    props.setActivePoint(false);
    let newCurPoint = props.currentPoint;
    newCurPoint++;
    props.setCurrentPoint(newCurPoint);
    toggleAllOff();
  }

  const handleSortChange = (newValue) => {
    let newDbUser = { ...dbUser };
    newDbUser.teams[currentEditTeam].playerSortOrder = newValue.value;
    props.setDbUser(newDbUser);
  }

  const startPoint = () => {
    // start timer if not started already
    startTimer();
    // TODO start point when roster confirmed (pull released)
    let gameTimeSecs = gameTimer.getTotalTimeValues().seconds;
    let newCurGame = { ...currentGame };
    //check size of currentGame Object - REMOVE
    console.log(JSON.stringify(newCurGame).length);
    // set active point to true
    props.setActivePoint(true);
    // record start of point in game history
    newCurGame.pointHistory[currentPoint] = {
      start: gameTimeSecs,
      isOffence: props.isOffence,
    }
    for (let player of props.currentPointLineUp) {
      newCurGame.playerStats[player.playerID].pointsPlayed.push(currentPoint);
    }
    // set new state
    props.setCurrentGame(newCurGame);
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

  const toggleAllOff = () => {
    let newTeamRoster = [...teamRoster];
    for (let player of newTeamRoster) player.selected = false;
    props.setCurrentPointLineUp(new Set());
    setTeamRoster(newTeamRoster);
  }

  const togglePlayer = (player) => {
    let newTeamRoster = [...teamRoster];
    let newPointLineUp = new Set([...props.currentPointLineUp]);
    let selected = newTeamRoster.find(i => i.playerID === player.playerID).selected;
    selected ? newPointLineUp.delete(player) : newPointLineUp.add(player);
    newTeamRoster.find(i => i.playerID === player.playerID).selected = !selected;
    props.setCurrentPointLineUp(newPointLineUp);
    setTeamRoster(newTeamRoster);
  }

  return (
    <div className='App teams-main'>
      <Scoreboard
        addTimerEntry={addTimerEntry}
        currentGame={currentGame}
        currentGameTime={props.currentGameTime}
        gameTimer={props.gameTimer}
        setCurrentGame={props.setCurrentGame}
        setCurrentGameTime={props.setCurrentGameTime}
        setTimerPaused={setTimerPaused}
        timerPaused={timerPaused}
      />
      {/* Component for choosing lineup at start of point */}
      {!props.activePoint ?
        <>
          {lineUp.size === currentGame.gameFormat.value ?
            <button
              className='btn btn-green'
              onClick={startPoint}
            >Start Point</button>
            :
            <h3>{`${lineUp.size} out of ${currentGame.gameFormat.value} players selected for ${props.isOffence ? 'Offence' : 'Defence'}`}</h3>
          }
          <RosterList
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
          {!isOffence && <button className='btn' onClick={() => {
            addHistoryEntry('oppPoint', {}, true);
          }}
          >Opposition Score</button>}
          <StatPlayerList
            activePlayers={props.currentPointLineUp}
            addHistoryEntry={addHistoryEntry}
            offence={props.isOffence}
            playerStats={Object.values(currentGame.playerStats)}
            prevEntry={prevEntry}
            timerPaused={timerPaused}
            timeStr={timeStr}
            setTimerPaused={setTimerPaused}
          />
        </>
      }
    </div >
  )
}
