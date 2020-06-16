import React from 'react'

export default function OngoingGame(props) {

  const discardGame = () => {
    localStorage.removeItem('currentGame');
    props.setCurrentGame(null);
  }

  return (
    <>
      {props.currentGame && localStorage.getItem('user') &&
        <div className='ongoing-game drop-shadow'>
          <h4 className='ongoing-game-title'>You have an unsaved game</h4>
          <div>
            <button className='btn btn-green' onClick={() => {
              window.location.href = '/#/stats';
            }}>Resume</button>
            <button className='btn btn-del' onClick={discardGame}>Discard</button>
          </div>
        </div>}
    </>
  )
}
