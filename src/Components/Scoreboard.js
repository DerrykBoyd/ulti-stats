import React, { useState } from 'react'

export default function Scoreboard(props) {

  let currentGame = props.currentGame;
  let timeStr = currentGame.gameTime || '00:00';
  let timer = props.gameTimer;
  let isLightJersy = currentGame.jerseyColour === 'Light';

  let [timerPaused, setTimerPaused] = useState(true);

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
      <h1>{`${timeStr}`}</h1>
      <div className='timer-controls'>
        {!currentGame.started && timerPaused &&
          <button className='btn btn-del' onClick={() => {
            let newGame = { ...currentGame };
            newGame.gameTime = '00:00';
            props.setCurrentGame(newGame);
          }}>Reset Time</button>}
        <button className='btn' onClick={() => {
          if (timer.isRunning()) {
            setTimerPaused(true);
            timer.stop();
            console.log('Timer stop')
          } else {
            setTimerPaused(false);
            timer.start({
              startValues: {
                minutes: parseInt(timeStr.split(':')[0]),
                seconds: parseInt(timeStr.split(':')[1]),
              }
            });
            console.log('Timer start')
          }
        }}
        >{timerPaused ? 'Start Time' : 'Pause Time'}</button>
      </div>
    </>
  )
}
