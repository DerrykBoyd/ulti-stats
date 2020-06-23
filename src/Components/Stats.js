import React, { useState, useEffect } from 'react';
import Select from 'react-select';

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
  let lineUp = props.currentPointLineUp;
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
    let newCurGame = { ...currentGame };
    let gameTimeSecs = gameTimer.getTotalTimeValues().seconds;
    let entry = {
      timeStamp: new Date(),
      gameTime: props.currentGameTime,
      gameTimeSecs: gameTimeSecs,
      action: action,
    }
    if (player.playerID) {
      entry.playerID = player.playerID;
      entry.playerName = `${player.firstName} ${player.lastName}`;
    }
    newCurGame.gameHistory.push(entry);
    // update the pointHistory and playerStats
    switch (action) {
      case 'point-started':
        newCurGame.pointHistory[currentPoint] = {
          start: gameTimeSecs,
          isOffence: props.isOffence,
        }
        for (let player of props.currentPointLineUp) {
          newCurGame.playerStats[player.playerID].pointsPlayed.push(currentPoint);
        }
        break;
      case 'point-finished':
        newCurGame.pointHistory[currentPoint].end = gameTimeSecs;
        props.setActivePoint(false);
        let newCurPoint = props.currentPoint;
        newCurPoint++;
        props.setCurrentPoint(newCurPoint);
        toggleAllOff();
        break;
      default:
        break;
    }
    // update the player stats
    // TODO other actions
    props.setCurrentGame(newCurGame);
  }

  const handleSortChange = (newValue) => {
    let newDbUser = { ...dbUser };
    newDbUser.teams[currentEditTeam].playerSortOrder = newValue.value;
    props.setDbUser(newDbUser);
  }

  const startPoint = () => {
    // TODO start point when roster confirmed (pull released)
    let newCurGame = { ...currentGame };
    console.log(JSON.stringify(newCurGame).length);
    // set active point to true
    props.setActivePoint(true);
    // record start of point in game history
    addHistoryEntry('point-started');
    // set new state
    props.setCurrentGame(newCurGame);
    // start timer if not started already
    if (timerPaused) {
      timer.start({
        startValues: {
          minutes: parseInt(timeStr.split(':')[0]),
          seconds: parseInt(timeStr.split(':')[1]),
        }
      });
      setTimerPaused(false);
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
        addHistoryEntry={addHistoryEntry}
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
          <div>TODO - start point when roster selected</div>
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
          {/* temp btn to reverse active point while dev stats page */}
          <button className='btn' onClick={() => {
            addHistoryEntry('point-finished');
            props.setIsOffence(!props.isOffence);
          }}
          >Toggle Active Point</button>
          <StatPlayerList
            activePlayers={props.currentPointLineUp}
            gameTimer={props.gameTimer}
            handleStatClick={addHistoryEntry}
            offence={props.isOffence}
            playerStats={Object.values(currentGame.playerStats)}
            prevEntry={props.prevEntry}
            timerPaused={timerPaused}
            timeStr={timeStr}
            setTimerPaused={setTimerPaused}
          />
        </>
      }
    </div >
  )
}
