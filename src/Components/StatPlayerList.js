import React from 'react'
import OffenseButtons from './OffenceButtons';
import DefenceButtons from './DefenceButtons';

import {sortByName} from '../Utils/utils';

export default function StatPlayerList(props) {

  const playerStats = props.playerStats.sort((a, b) => {
    switch (localStorage.getItem('currentSort')) {
      case 'Number':
        return a.number - b.number
      case 'First Name':
        return sortByName(a.firstName, b.firstName)
      case 'Last Name':
        return sortByName(a.lastName, b.lastName)
      default:
        return a.number - b.number
    }
  });

  const handleStatClick = (e, player, turnOver = false) => {
    let action = e.currentTarget.name;
    // use props.addhistoryentry after validation
    props.addHistoryEntry(action, player, turnOver);
  }

  const list = playerStats.map(player =>
    <React.Fragment key={player.playerID}>
      {Array.from(props.activePlayers).find(el => el.playerID === player.playerID) &&
        <div className='player-stat-row'>
          <div
            className={`player-stat-name`}
          >
            <span className='player-text'>{`#${player.number} - ${player.firstName} ${player.lastName}`}</span>
          </div>
          {props.offence &&
            <OffenseButtons
              player={player}
              handleStatClick={handleStatClick}
              prevEntry={props.prevEntry}
            />}
          {!props.offence &&
            <DefenceButtons
              player={player}
              handleStatClick={handleStatClick}
            />}
        </div>}
    </React.Fragment>
  )

  return (
    <div className='player-stat-list'>{list}</div>
  )
}