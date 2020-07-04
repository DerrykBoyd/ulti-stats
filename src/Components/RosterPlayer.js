import React, { useState, useEffect } from 'react'

export default function RosterPlayer(props) {

  let player = props.player;

  let [selected, setSelected] = useState(false);

  useEffect(() => {
    if (props.lineUp && props.lineUp.find(el => el.playerID === player.playerID)) setSelected(true);
    else setSelected(false);
  }, [player.playerID, props.lineUp])

  return (
    <div
      className={`player-list-item ${selected ? 'selected' : ''}`}
      onClick={() => {
        props.togglePlayer(player, selected)
      }}
    >
      <div className='player-num-header'>{player.number}</div>
      <div className='player-name-header'>{player.firstName}</div>
      <div className='player-name-header'>{player.lastName}</div>
      {selected ?
        <span
          className="material-icons player-checkbox fade-in"
        >check_box</span>
        :
        <span
          className="material-icons player-checkbox"
        >check_box_outline_blank</span>}
    </div>
  )
}
