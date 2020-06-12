import React from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

// helper functions
import * as db from '../Utils/db';
import { sortTeams } from '../Utils/utils';

import '../styles/NewGame.css';

export default function NewGame(props) {

  // set state

  const dbUser = props.dbUser;
  const gameOptions = props.gameOptions;
  const setGameOptions = props.setGameOptions;
  const teamOptions = props.teamOptions;

  const rsStyles = {
    container: (provided) => ({
      ...provided,
      width: '100%',
    })
  }

  return (
    <div className='App'>
      {props.dbUser &&
        <div className='new-game-main'>
          <h2>Game Setup</h2>
          <div className='game-setup'>
            {teamOptions[0] ?
              <>
                <h4 className='rs-title'>Team</h4>
                <Select
                  defaultValue={gameOptions.statTeam || teamOptions[0]}
                  isSearchable={false}
                  onChange={(newValue => {
                    let newGameOptions = { ...gameOptions };
                    newGameOptions.statTeam = newValue;
                    setGameOptions(newGameOptions);
                  })}
                  options={teamOptions}
                  styles={rsStyles}
                ></Select>
                <div className='rs-options-2'>
                  <div className='rs-options-2-1 rs-left'>
                    <h4 className='rs-title'>Jersey Colour</h4>
                    <Select
                      defaultValue={{
                        value: gameOptions.jerseyColour,
                        label: gameOptions.jerseyColour,
                      }}
                      isSearchable={false}
                      onChange={(newValue => {
                        let newGameOptions = { ...gameOptions };
                        newGameOptions.jerseyColour = newValue.value;
                        setGameOptions(newGameOptions);
                      })}
                      options={
                        [
                          { value: 'Light', label: 'Light' },
                          { value: 'Dark', label: 'Dark' }
                        ]
                      }
                      styles={rsStyles}
                    ></Select>
                  </div>
                  <div className='rs-options-2-1 rs-right'>
                    <h4 className='rs-title'>Starting On</h4>
                    <Select
                      defaultValue={{
                        value: gameOptions.startingOn,
                        label: gameOptions.startingOn,
                      }}
                      isSearchable={false}
                      onChange={(newValue => {
                        let newGameOptions = { ...gameOptions };
                        newGameOptions.startingOn = newValue.value;
                        setGameOptions(newGameOptions);
                      })}
                      options={
                        [
                          { value: 'Offence', label: 'Offence' },
                          { value: 'Defence', label: 'Defence' }
                        ]
                      }
                      styles={rsStyles}
                    ></Select>
                  </div>
                </div>
                <h4 className='rs-title'>Opponent
                  <span className='text-dis'> (Type to search or add)</span></h4>
                <CreatableSelect
                  isClearable
                  defaultValue={gameOptions.opponent ? 
                  {
                    value: gameOptions.opponent,
                    label: gameOptions.opponent,
                  } : ''}
                  onChange={(newValue => {
                    if (!newValue) {
                      let newGameOptions = { ...gameOptions };
                      newGameOptions.opponent = '';
                      setGameOptions(newGameOptions);
                      return;
                    }
                    let newGameOptions = { ...gameOptions };
                    newGameOptions.opponent = newValue.value;
                    setGameOptions(newGameOptions);
                    if (newValue.__isNew__) {
                      // update state with new opponent
                      let newDbUser = { ...props.dbUser };
                      newDbUser.opponents.push({
                        value: newValue.value, label: newValue.label
                      });
                      props.setDbUser(newDbUser);
                      // add to the db
                      db.addOpponent(props.dbUser.uid, gameOptions.statTeam.teamID, {
                        value: newValue.value, label: newValue.label
                      });
                    }
                  })}
                  options={dbUser.opponents.sort((a, b) => {
                    return sortTeams(a.value, b.value)
                  })}
                  styles={rsStyles}
                ></CreatableSelect>
                <h4 className='rs-title'>Game Format</h4>
                <Select
                  defaultValue={gameOptions.gameFormat || {
                    value: 7,
                    label: '7 v 7'
                  }}
                  onChange={(newValue => {
                    let newGameOptions = { ...gameOptions };
                    newGameOptions.gameFormat = newValue;
                    setGameOptions(newGameOptions);
                  })}
                  options={[
                    {value: 7, label: `7 v 7`},
                    {value: 6, label: `6 v 6`},
                    {value: 5, label: `5 v 5`},
                    {value: 4, label: `4 v 4`},
                    {value: 3, label: `3 v 3`},
                  ]}
                  styles={rsStyles}
                ></Select>
                <div className='game-opt-btn-container'>
                  <button
                    className='btn'
                    onClick={() => console.log(`Finish setup clicked`)}
                  >Finish Setup</button>
                </div>
              </>
              :
              <p>You must create at least one team before starting a new game.</p>
            }
          </div>
        </div>
      }
    </div>
  )
}