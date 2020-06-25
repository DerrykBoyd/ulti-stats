import React from 'react'
import RosterPlayer from './RosterPlayer';

export default function RosterList(props) {

  let teamRoster = props.teamRoster;

  return (
    <div className='player-list'>
      {teamRoster && teamRoster.map((player) => (
        <RosterPlayer
          key={player.playerID}
          player={player}
          lineUp={props.lineUp}
          togglePlayer={props.togglePlayer}
        />
      ))}
    </div>
  )
}
