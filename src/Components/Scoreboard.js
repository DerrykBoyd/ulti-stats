import React from 'react'

export default function Scoreboard(props) {

  let currentGame = props.currentGame;
  let timer = props.currentGameTimer;
  let isLightJersy = currentGame.jerseyColour === 'Light';

  return (
    <>
      <div className='game-info'>
        <div className={`score-card ${!isLightJersy ? 'dark' : ''}`}>
          <div className='score-team'>{currentGame.teamName}</div>
          <div className='score-text'>{currentGame.score[currentGame.teamName]}</div>
        </div>
        <div className={`score-card ${isLightJersy ? 'dark' : ''}`}>
          <div className='score-team'>{currentGame.opponent}</div>
          <div className='score-text'>{currentGame.score[currentGame.opponent]}</div>
        </div>
      </div>
      <h1>{`${timer.getTimeValues().minutes.toString().padStart(2, 0)}:${timer.getTimeValues().seconds.toString().padStart(2, 0)}`}</h1>
    </>
  )
}
