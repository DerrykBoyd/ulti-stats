import React from 'react'
import {toast} from 'react-toastify';

import { delGame } from '../Utils/db';

export default function OngoingGame(props) {

  const discardGame = () => {
    toast.dismiss();
    localStorage.removeItem('currentGame');
    localStorage.removeItem('currentGameTime');
    localStorage.removeItem('activePoint');
    // Delete the game from the database
    delGame(props.currentGame);
    // reset the state variables
    props.resetGame();
  }

  return (
    <>
      {props.currentGame && localStorage.getItem('user') &&
        <div className='ongoing-game drop-shadow'>
          <h4 className='ongoing-game-title'>You have an unsaved game</h4>
          <div className='btn-container'>
            <button className='btn btn-green' onClick={() => {
              window.location.href = '/#/stats';
            }}>Resume</button>
            <button className='btn btn-del' onClick={discardGame}>Discard</button>
          </div>
        </div>}
    </>
  )
}
