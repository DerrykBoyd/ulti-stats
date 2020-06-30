import React from 'react'
import Scoreboard from './Scoreboard';
import { useHistory } from 'react-router-dom';

export default function GameCard(props) {

  let game = props.game;
  let history = useHistory();

  let date = new Date(game.createdTime);

  return (
    <div className='card game-card'>
      <div className='game-card-header'>{`${date.toDateString()} - ${date.toLocaleTimeString([], { hour12: true })}`}</div>
      <div className='game-card-header'>Final Score</div>
      <Scoreboard game={game} />
      <button
        className='btn'
        onClick={() => history.push(`/games/${game.gameID}`)}
      >Game Details</button>
    </div>
  )
}
