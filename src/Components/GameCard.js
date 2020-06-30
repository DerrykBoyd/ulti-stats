import React, { useState } from 'react'
import Scoreboard from './Scoreboard';
import { useHistory } from 'react-router-dom';

import { delGame } from '../Utils/dbUtils';
import DelModal from './DelModal';

export default function GameCard(props) {

  const [delModal, setDelModal] = useState(false);

  let game = props.game;
  let history = useHistory();

  let date = new Date(game.createdTime);

  function confrimDelete() {
    // delete game from the database
    delGame(game)
    // delete game from state
    props.delGameFromState(game.gameID);
    // close the confirmation modal
    setDelModal(false);
  }

  return (
    <>
      {delModal &&
        <DelModal
          header='Delete Game'
          message="Are you sure?"
          onConfirm={confrimDelete}
          setDelModal={setDelModal}
        />
      }
      <div className='card game-card'>
        <div className='game-card-header'>{`${date.toDateString()} - ${date.toLocaleTimeString([], { hour12: true })}`}</div>
        <div className='game-card-header'>Final Score</div>
        <Scoreboard game={game} />
        <div className='btn-container'>
          <button
            className='btn btn-del-text'
            onClick={() => setDelModal(true)}
          >Delete</button>
          <button
            className='btn'
            onClick={() => history.push(`/games/${game.gameID}`)}
          >Game Details</button>
        </div>
      </div>
    </>
  )
}
