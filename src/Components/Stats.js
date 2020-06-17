import React, { useState, useEffect } from 'react';

import { sortByName } from '../Utils/utils';

export default function Stats(props) {

  let currentGame = props.currentGame;

  // set state
  const [teamRoster, setTeamRoster] = useState(null);
  const [pointLineUp, setPointLineUp] = useState([]);

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

  return (
    <div className='App'>
      <h4>TODO Scoreboard and timer go here</h4>
      {/* Component for choosing lineup at start of point */}
      {!currentGame.activePoint ?
        <>
          <h3>{`Choose players to start on ${currentGame.isOffence ? 'Offence' : 'Defence'}`}</h3>
          <p>Choose Lineup here from list of players</p>
          {teamRoster && teamRoster.map((player) => (
            <div key={player.playerID}>{`${player.number}, ${player.firstName}, ${player.lastName}`}</div>
          ))}
          <p>TODO Add Player to roster here</p>
          <p>TODO Check number of selected players is equal to the game format</p>
          <div>confirm lineup btn when correct number of players is selected</div>
          {pointLineUp.length === currentGame.gameFormat.value && 
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
