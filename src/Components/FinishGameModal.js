import React from 'react'
import {useHistory} from 'react-router-dom';

export default function DelGameModal(props) {

  let history = useHistory();

  return (
    <>
      <div className='modal-overlay'></div>
      <div className='modal-wrapper'>
        <div className='modal-container card'>
          <div className='modal-title'>Finish Game?</div>
          <div className='modal-body'>This will write the game to the database. No more statistics can be added to the game after this action.</div>
          <div className='btn-container'>
            <button
              className='btn btn-del-text'
              onClick={() => props.setConfirmDel(false)}
            >Cancel</button>
            <button
              className='btn btn-green'
              onClick={() => {
                props.finishGame();
                history.push('/games');
              }}
            >Confirm & Save</button>
          </div>
        </div>
      </div>
    </>
  )
}
