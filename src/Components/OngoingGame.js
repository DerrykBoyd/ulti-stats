import React from 'react'
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';

export default function OngoingGame(props) {

  let undo = false;

  let history = useHistory();

  const Undo = ({ closeToast }) => {
    const handleClick = () => {
      props.setPendingDel(false);
      undo = true;
      closeToast();
    };

    return (
      <div className='del-toast'>
        <h3>Game Deleted</h3>
        <button className='btn btn-del' onClick={handleClick}>UNDO</button>
      </div>
    );
  };

  return (
    <>
      {localStorage.getItem('user') && props.currentGame && !props.pendingDel &&
        <div className='ongoing-game drop-shadow'>
          <span className='ongoing-game-title'>You have an ongoing game</span>
          <div className='btn-container'>
            <button className='btn btn-green og-btn' onClick={() => {
              history.push('/stats');
            }}>Resume</button>
            <button className='btn btn-del og-btn' onClick={() => {
              props.setPendingDel(true);
              undo = false;
              toast(<Undo />, {
                onClose: () => {
                  if (!undo) {
                    props.removeLocalGame();
                    props.setPendingDel(false);
                  }
                },
                closeOnClick: false,
                closeButton: false,
                hideProgressBar: false,
                progressStyle: {
                  background: '#c62828'
                }
              })
            }}>Discard</button>
          </div>
        </div>}
    </>
  )
}
