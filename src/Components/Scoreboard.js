import React from 'react'

export default function Scoreboard(props) {

  let currentGame = props.currentGame;
  let timeStr = props.currentGameTime || '00:00';
  let timer = props.gameTimer;
  let timerPaused = props.timerPaused;
  let setTimerPaused = props.setTimerPaused;

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
      <div className='timer-controls'>
        {!currentGame.started && timerPaused ?
          <button className='btn btn-del' onClick={() => {
            props.setCurrentGameTime('00:00');
            localStorage.setItem('currentGameTime', '00:00');
            props.addHistoryEntry('clock-reset');
          }}>Reset Time</button>
          :
          <button className='btn btn-inactive'>Reset Time</button>}
        <h1 className='game-clock'>{`${timeStr}`}</h1>
        <button className={`btn`} onClick={() => {
          if (timer.isRunning()) {
            setTimerPaused(true);
            timer.stop();
            console.log('Timer stop');
            props.addHistoryEntry('clock-paused');
          } else {
            setTimerPaused(false);
            timer.start({
              startValues: {
                minutes: parseInt(timeStr.split(':')[0]),
                seconds: parseInt(timeStr.split(':')[1]),
              }
            });
            console.log('Timer start');
            props.addHistoryEntry('clock-started');
          }
        }}
        >{timerPaused ? 'Start Time' : 'Pause Time'}</button>
      </div>
    </>
  )
}