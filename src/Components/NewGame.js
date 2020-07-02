import React, { useState, useEffect } from 'react';

import { v4 as uuid } from 'uuid';

// helper functions
import * as dbUtils from '../Utils/dbUtils';
import { sortTeams } from '../Utils/utils';

import '../styles/NewGame.css';
import { Redirect, useHistory } from 'react-router-dom';

export default function NewGame(props) {

  // set the page title
  useEffect(() => {
    document.title = `Ultimate Stats - ${props.title}`
  }, [props.title])

  // set state
  const [formErr, setFormErr] = useState({});
  const [newOpp, setNewOpp] = useState('');
  const [showAddOpp, setShowAddOpp] = useState(false);

  const dbUser = props.dbUser;
  const gameOptions = props.gameOptions;
  const isTeams = dbUser ? Object.values(dbUser.teams).length : false;
  const setGameOptions = props.setGameOptions;

  let history = useHistory();

  const createGame = () => {
    if (!gameOptions.statTeam) {
      setFormErr({
        type: 'team',
        message: 'Please select a team',
      })
      return
    }
    if (!gameOptions.opponent) {
      setFormErr({
        type: 'opponent',
        message: 'Please select an opponent',
      })
      return;
    }
    let isOffence = false;
    if (gameOptions.startingOn === 'Offence') isOffence = true;
    props.setIsOffence(isOffence);
    let stats = {};
    // add each player to the game data
    let teamData = Object.values(dbUser.teams).find(team => team.name === gameOptions.statTeam);
    Object.values(teamData.players).map(player =>
      stats[player.playerID] = {
        firstName: player.firstName,
        lastName: player.lastName,
        number: player.number,
        playerID: player.playerID,
        pointsPlayed: [],
        assist: 0,
        dError: 0,
        dPlay: 0,
        drop: 0,
        point: 0,
        throwAway: 0,
        touch: 0,
      }
    );
    // set the game data
    let newGame = {
      createdBy: dbUser.uid,
      createdTime: Date.now(),
      creatorEmail: dbUser.email,
      creatorName: dbUser.name || '',
      gameID: uuid(),
      gameFormat: parseInt(gameOptions.gameFormat),
      gameHistory: [],
      jerseyColour: gameOptions.jerseyColour,
      opponent: gameOptions.opponent,
      playerStats: stats,
      pointHistory: {},
      score: {
        [gameOptions.statTeam]: 0,
        [gameOptions.opponent]: 0,
      },
      startingOn: gameOptions.startingOn,
      teamName: gameOptions.statTeam,
      teamID: teamData.teamID,
      timeOuts: {
        [gameOptions.statTeam]: [],
        [gameOptions.opponent]: [],
      },
      timerHistory: [],
    }
    // set the current game to the new game
    props.setCurrentGame(newGame);
  }

  const addOpp = () => {
    // add to state
    let newDbUser = { ...dbUser };
    newDbUser.opponents.push(newOpp);
    props.setDbUser(newDbUser);
    let newGameOptions = { ...gameOptions };
    newGameOptions.opponent = newOpp;
    setGameOptions(newGameOptions);
    // update the database
    dbUtils.addOpponent(dbUser.uid, newOpp)
    setNewOpp('');
    setShowAddOpp(false);
  }

  return (
    <>
      {props.currentGame ?
        <Redirect to='/stats'></Redirect>
        :
        <div className='App'>
          {props.dbUser &&
            <div className='new-game-main btm-nav-page'>
              <h2>Game Setup</h2>
              <div className='game-setup'>
                {isTeams ?
                  <>
                    <h4 className='rs-title'>Team</h4>
                    <select
                      value={gameOptions.statTeam}
                      name='team-select'
                      id='team-select'
                      onChange={(e) => {
                        let newGameOptions = { ...gameOptions };
                        newGameOptions.statTeam = e.target.value;
                        setGameOptions(newGameOptions);
                      }}
                    >
                      <option value=''></option>
                      {Object.values(dbUser.teams).sort((a, b) => {
                        return sortTeams(a.name, b.name)
                      }).map((team, ind) => {
                        return (
                          <option
                            value={team.name}
                            key={team.name}
                          >{team.name}</option>
                        )
                      })}
                    </select>
                    {formErr.type === 'team' && <div className='form-error'>{formErr.message}</div>}
                    <h4 className='rs-title'>Opponent</h4>
                    <select
                      value={gameOptions.opponent}
                      name='opponent-select'
                      id='opponent-select'
                      onChange={e => {
                        let newGameOptions = { ...gameOptions };
                        newGameOptions.opponent = e.target.value;
                        setGameOptions(newGameOptions);
                      }}
                    >
                      <option value=''></option>
                      {dbUser.opponents.map(opponent => {
                        return (
                          <option
                            value={opponent}
                            key={`opponent ${opponent}`}
                          >{opponent}</option>
                        )
                      })}
                    </select>
                    {showAddOpp ?
                      <div className='btn-container'>
                        <input
                          className='player-input'
                          value={newOpp}
                          onChange={e => {
                            setNewOpp(e.target.value);
                          }}
                        ></input>
                        <button
                          className='btn btn-green-text'
                          onClick={addOpp}
                        >Add</button>
                        <button
                          className='btn btn-del-text'
                          onClick={() => setShowAddOpp(false)}
                        >Cancel</button>
                      </div>
                      :
                      <div className='btn-container'>
                        <button
                          className='btn'
                          onClick={() => setShowAddOpp(true)}
                        >Add Opponent</button>
                      </div>
                    }
                    {formErr.type === 'opponent' && <div className='form-error'>{formErr.message}</div>}
                    <div className='rs-options-2'>
                      <div className='rs-options-2-1 rs-left'>
                        <h4 className='rs-title'>Jersey Colour</h4>
                        <select
                          name='jersey-select'
                          value={gameOptions.jerseyColour}
                          onChange={e => {
                            let newGameOptions = { ...gameOptions };
                            newGameOptions.jerseyColour = e.target.value;
                            setGameOptions(newGameOptions);
                          }}
                        >
                          <option value='Light'>Light</option>
                          <option value='Dark'>Dark</option>
                        </select>
                      </div>
                      <div className='rs-options-2-1 rs-right'>
                        <h4 className='rs-title'>Starting On</h4>
                        <select
                          name='offence-select'
                          value={gameOptions.startingOn}
                          onChange={e => {
                            let newGameOptions = { ...gameOptions };
                            newGameOptions.startingOn = e.target.value;
                            setGameOptions(newGameOptions);
                          }}
                        >
                          <option value='Offence'>Offence</option>
                          <option value='Defence'>Defence</option>
                        </select>
                      </div>
                    </div>
                    <h4 className='rs-title'>Game Format</h4>
                    <select
                      value={gameOptions.gameFormat}
                      name='format-select'
                      onChange={e => {
                        let newGameOptions = { ...gameOptions };
                        newGameOptions.gameFormat = e.target.value;
                        setGameOptions(newGameOptions);
                      }}
                    >
                      <option value={'7'}>7 v 7</option>
                      <option value={'6'}>6 v 6</option>
                      <option value={'5'}>5 v 5</option>
                      <option value={'4'}>4 v 4</option>
                      <option value={'3'}>3 v 3</option>
                    </select>
                    <div className='game-opt-btn-container'>
                      <button
                        className='btn btn-del-text'
                        onClick={() => history.goBack()}
                      >Cancel</button>
                      <button
                        className='btn btn-green-text'
                        onClick={createGame}
                      >Finish Setup</button>
                    </div>
                  </>
                  :
                  <h3>You must create at least one team before starting a new game.</h3>
                }
              </div>
            </div>
          }
        </div>}
    </>
  )
}