import React from 'react';

export default function Scoreboard(props) {

  let game = props.game;

  let isLightJersy = game.jerseyColour === 'Light';

  return (
    <div className='game-info'>
      <div className={`score-card ${!isLightJersy ? 'dark' : ''}`}>
        <div className='score-team'>{game.teamName}</div>
        <div className='score-text'>{game.score[game.teamName]}</div>
      </div>
      <div className={`score-card ${isLightJersy ? 'dark' : ''}`}>
        <div className='score-team'>{game.opponent}</div>
        <div className='score-text'>{game.score[game.opponent]}</div>
      </div>
    </div>
  )
}
