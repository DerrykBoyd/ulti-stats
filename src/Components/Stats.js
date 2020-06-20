import React, { useState, useEffect } from 'react';
import Select from 'react-select';

import { sortByName, sortOrderOptions } from '../Utils/utils';

import AddPlayerForm from './AddPlayerForm';
import Scoreboard from './Scoreboard';

import '../styles/Stats.css';
import RosterList from './RosterList';

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
        return team.teamID === currentGame.teamID;
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

  const startPoint = () => {
    // TODO start point when roster confirmed (pull released)
    // set active point to true
    // record start of point in game history
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
        currentGame={currentGame}
        setCurrentGame={props.setCurrentGame}
        gameTimer={props.gameTimer}
      />
      {/* Component for choosing lineup at start of point */}
      {!currentGame.activePoint ?
        <>
          {lineUp.size === currentGame.gameFormat.value ?
            <button
              className='btn btn-green'
              onClick={startPoint}
            >Confirm Lineup</button>
            :
            <h3>{`${lineUp.size} out of ${currentGame.gameFormat.value} players selected for ${currentGame.isOffence ? 'Offence' : 'Defence'}`}</h3>
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
        </>
        :
        // Take stats when there is an active point.
        <div>Take stats when there is an active point.</div>
      }
    </div >
  )
}
