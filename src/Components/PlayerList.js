import React from 'react';
import PlayerListItem from './PlayerListItem';

export default function PlayerList(props) {

  const currentEditTeam = props.dbUser.teams[props.currentEditTeam];
  const playerArr = Object.values(props.players);

  const sortByName = (a, b) => {
    let nameA = a.toUpperCase();
    let nameB = b.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0
  }

  playerArr.sort((a, b) => {
    switch (currentEditTeam.playerSortOrder) {
      case 'Number':
        return a.number - b.number
      case 'First Name':
        return sortByName(a.firstName, b.firstName)
      case 'Last Name':
        return sortByName(a.lastName, b.lastName)
      default:
        console.log('No sort order')
        return 0
    }
  })

  const deletePlayer = (playerID) => {
    let newDbUser = { ...props.dbUser };
    delete newDbUser.teams[`${currentEditTeam.teamID}`].players[`${playerID}`];
    newDbUser.teams[`${currentEditTeam.teamID}`].unsavedChanges = true;
    props.setDbUser(newDbUser);
  }

  return (
    playerArr.map((player, index) => (
      <PlayerListItem
        currentEditTeam={currentEditTeam}
        dbUser={props.dbUser}
        deletePlayer={deletePlayer}
        key={player.playerID}
        player={player}
        setDbUser={props.setDbUser}
        setUnsaved={props.setUnsaved}
        index={index}
      />
    ))
  )
}