import React, { useState, useEffect, useRef } from 'react';

import { v4 as uuid } from 'uuid';

// helper functions
import * as dbUtils from '../Utils/dbUtils';
import { sortTeams } from '../Utils/utils';

import '../styles/NewGame.css';
import { Redirect, useHistory } from 'react-router-dom';

export default function NewGame(props) {

  // set state
  const [formErr, setFormErr] = useState({});
  const [filteredOpponents, setFilteredOpponents] = useState([]);
  const [renderFilter, setRenderFilter] = useState(false);

  // set the page title
  useEffect(() => {
    document.title = `Ultimate Stats - ${props.title}`
  }, [props.title])

  // check for mouseClick outside of profile menu to close
  const filterList = useRef();
  const oppInput = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (renderFilter && filterList.current &&
        (filterList.current.contains(e.target) || oppInput.current.contains(e.target))) {
        return;
      }
      else setRenderFilter(false);
    }

    document.addEventListener('mousedown', handleClick)

    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  })

  const dbUser = props.dbUser;
  const gameOptions = props.gameOptions;
  const isTeams = dbUser ? Object.values(dbUser.teams).length : false;
  const setGameOptions = props.setGameOptions;

  let history = useHistory();

  // update the filtered opponents on state change
  useEffect(() => {
    if (!dbUser || !gameOptions) return;
    let options = { ...gameOptions };
    let newFiltered = [...dbUser.opponents].filter(opp => {
      return opp.toLowerCase().includes(options.opponent.toLowerCase())
    }).sort();
    setFilteredOpponents(newFiltered);
  }, [gameOptions, dbUser])

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
        message: 'Please set an opponent',
      })
      return;
    }
    addOpp();
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
    if (newDbUser.opponents.indexOf(gameOptions.opponent) !== -1) return;
    newDbUser.opponents.push(gameOptions.opponent)
    props.setDbUser(newDbUser);
    // update the database
    dbUtils.addOpponent(dbUser.uid, gameOptions.opponent)
  }

  function showFilter() {
    setRenderFilter(true);
  }

  function setOpp(name) {
    let newGameOptions = { ...gameOptions };
    newGameOptions.opponent = name;
    setGameOptions(newGameOptions);
  }

  return (
    <>
      {props.currentGame ?
        <Redirect to='/stats'></Redirect>
        :
        <div className='App'>
          {props.dbUser &&
            <div className='new-game-main btm-nav-page'>
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
                      onFocus={e => {
                        setRenderFilter(false)
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
                    <input
                      value={gameOptions.opponent}
                      ref={oppInput}
                      name='opponent-input'
                      id='opponent-input'
                      autoComplete="off"
                      onFocus={showFilter}
                      onChange={e => {
                        setOpp(e.target.value);
                        setRenderFilter(true);
                      }}
                      onClick={showFilter}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setRenderFilter(false);
                        }
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          let option = document.getElementById(`opp0`);
                          if (option) option.focus();
                        }
                      }}
                    ></input>
                    {renderFilter && filteredOpponents.length > 0 &&
                      <datalist ref={filterList} className='card input-filter'>
                        {
                          filteredOpponents.map((opp, ind) => {
                            return (
                              <option
                                id={'opp' + ind}
                                key={opp + ind}
                                name={opp}
                                className='filtered-opp'
                                tabIndex='0'
                                onClick={e => {
                                  setOpp(e.target.getAttribute('name'))
                                  setRenderFilter(false);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    setOpp(e.target.getAttribute('name'));
                                    setRenderFilter(false);
                                  }
                                  if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    let next = document.getElementById(`opp${ind+1}`);
                                    if (next) next.focus();
                                  }
                                  if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    let prev = document.getElementById(`opp${ind-1}`);
                                    let oppInput = document.getElementById('opponent-input');
                                    prev ? prev.focus() : oppInput.focus();
                                  }
                                }}
                              >{opp}</option>
                            )
                          })
                        }
                      </datalist>
                    }
                    {formErr.type === 'opponent' && <div className='form-error'>{formErr.message}</div>}
                    <div className='rs-options-2'>
                      <div className='rs-options-2-1 rs-left'>
                        <h4 className='rs-title'>Jersey Colour</h4>
                        <select
                          id="jersey-select"
                          name='jersey-select'
                          value={gameOptions.jerseyColour}
                          onChange={e => {
                            let newGameOptions = { ...gameOptions };
                            newGameOptions.jerseyColour = e.target.value;
                            setGameOptions(newGameOptions);
                          }}
                          onFocus={e => {
                            setRenderFilter(false)
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