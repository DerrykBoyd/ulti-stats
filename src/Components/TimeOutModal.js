import React, { useState, useEffect } from 'react'

export default function TimeOutModal(props) {

  let currentGame = props.currentGame;
  let timeSecs = props.timeSecs;
  let startTimer = props.startTimer;

  let [team, setTeam] = useState(localStorage.getItem('timeOutTeam') || '');
  let [timeStarted, setTimeStarted] = useState(localStorage.getItem('timeOutStarted') || null);

  useEffect(() => {
    if (team) startTimer();
  }, [team, startTimer])

  useEffect(() => {
    localStorage.setItem('timeOutTeam', team);
    localStorage.setItem('timeOutStarted', timeStarted);
  }, [team, timeStarted])

  return (
    <>
      <div className='modal-overlay'></div>
      <div className='modal-wrapper'>
        <div className='modal-container card'>
          {team ?
            <>
              <h4>{`Timeout started for ${team}`}</h4>
              <h4>{`${timeSecs - timeStarted} seconds`}</h4>
              <button
                className='btn'
                onClick={() => {
                  props.timeOutEnd(team);
                  localStorage.removeItem('timeOutTeam');
                  localStorage.removeItem('timeOutStarted');
                  setTeam('');
                  setTimeStarted(null);
                  props.setActiveTimeOut(false);
                }}
              >End Timeout</button>
            </>
            :
            <>
              <h4>Timeout taken by?</h4>
              <div className='btn-container'>
                <button
                  className={`btn ${currentGame.jerseyColour === 'Dark' ? 'btn-dark' : 'btn-white'}`}
                  onClick={() => {
                    props.startTimer();
                    props.timeOutStart(currentGame.teamName);
                    setTeam(currentGame.teamName);
                    setTimeStarted(timeSecs);
                  }}
                >{currentGame.teamName}</button>
                <button
                  className={`btn ${currentGame.jerseyColour === 'Dark' ? 'btn-white' : 'btn-dark'}`}
                  onClick={() => {
                    startTimer();
                    props.timeOutStart(currentGame.opponent);
                    setTeam(currentGame.opponent);
                    setTimeStarted(timeSecs);
                  }}
                >{currentGame.opponent}</button>
              </div>
              <button
                className='btn btn-del'
                onClick={() => props.setActiveTimeOut(false)}
              >Cancel</button>
            </>
          }
        </div>
      </div>
    </>
  )
}
