import React, { useState, useEffect } from 'react';
import Select from 'react-select';

import { sortByName, sortOrderOptions } from '../Utils/utils';

import AddPlayerForm from './AddPlayerForm';
import Scoreboard from './Scoreboard';

import '../styles/Stats.css';

export default function Stats(props) {

  let currentGame = props.currentGame;
  let currentEditTeam = props.currentGame.teamID;
  let dbUser = props.dbUser;
  let lineUp = props.currentPointLineUp;

  const rsStyles = {
    container: (provided) => ({
      ...provided,
      'minWidth': '140px',
    })
  }

  // set state
  const [teamRoster, setTeamRoster] = useState(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  // update state when user data updated
  useEffect(() => {
    if (props.dbUser) {
      let teamData = Object.values(props.dbUser.teams).find((team) => {
        return team.name === currentGame.teamName;
      });
      let newTeamRoster = Object.values(teamData.players);
      newTeamRoster.sort((a, b) => {
        switch (currentGame.playerSortOrder) {
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
  }, [props.dbUser, currentGame])

  const handleSortChange = (newValue) => {
    let newGameSort = { ...currentGame };
    newGameSort.playerSortOrder = newValue.value;
    props.setCurrentGame(newGameSort);
  }

  return (
    <div className='App'>
      <Scoreboard
        currentGame={currentGame}
        currentGameTimer={props.currentGameTimer}
      />
      {/* Component for choosing lineup at start of point */}
      {!currentGame.activePoint ?
        <>
          <h3>{`Choose ${currentGame.gameFormat.value} players to start on ${currentGame.isOffence ? 'Offence' : 'Defence'}`}</h3>
          <p>Choose Lineup here from list of players</p>
          {teamRoster && teamRoster.map((player) => (
            <div key={player.playerID}>{`${player.number}, ${player.firstName}, ${player.lastName}`}</div>
          ))}
          <p>TODO Add Player to roster here</p>
          <form>
            {showAddPlayer ?
              <AddPlayerForm
                currentEditTeam={currentEditTeam}
                dbUser={dbUser}
                saveToDb={true}
                setDbUser={props.setDbUser}
                setShowAddPlayer={setShowAddPlayer}
              />
              :
              <div className='player-list-options'>
                <button className='btn' onClick={() => setShowAddPlayer(true)}>Add Player</button>
                <div className='sort-select'>
                  <span>Sort</span>
                  {dbUser &&
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
          <p>TODO Check number of selected players is equal to the game format</p>
          <div>confirm lineup btn when correct number of players is selected</div>
          {lineUp.length === currentGame.gameFormat.value &&
            <button className='btn btn-green'>Confirm Lineup</button>
          }
        </>
        :
        // Take stats when there is an active point.
        <div>Take stats when there is an active point.</div>
      }
    </div>
  )
}
