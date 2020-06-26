import React from 'react'

export default function OngoingGame(props) {

  return (
    <>
      {props.currentGame && localStorage.getItem('user') &&
        <div className='ongoing-game drop-shadow'>
          <h4 className='ongoing-game-title'>You have an unsaved game</h4>
          <div className='btn-container'>
            <button className='btn btn-green' onClick={() => {
              window.location.href = '/#/stats';
            }}>Resume</button>
            <button className='btn btn-del' onClick={props.removeLocalGame}>Discard</button>
          </div>
        </div>}
    </>
  )
}
