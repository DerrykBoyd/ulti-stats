import React from 'react'

export default function RosterList(props) {

  let teamRoster = props.teamRoster;

  return (
    <div className='player-list'>
            {teamRoster && teamRoster.map((player) => (
              // TODO Roster List component
              <div
                key={player.playerID}
                className={`player-list-item ${player.selected ? 'selected' : ''}`}
              >
                <div className='player-num-header'>{player.number}</div>
                <div className='player-name-header'>{player.firstName}</div>
                <div className='player-name-header'>{player.lastName}</div>
                {player.selected ?
                  <span
                    className="material-icons player-checkbox fade-in"
                    onClick={() => props.togglePlayer(player)}
                  >check_box</span>
                  :
                  <span
                    className="material-icons player-checkbox"
                    onClick={() => props.togglePlayer(player)}
                  >check_box_outline_blank</span>}
              </div>
            ))}
          </div>
  )
}
