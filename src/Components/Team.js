import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import Select from 'react-select';

// helper functions
import * as db from '../Utils/db';

// Components
import PlayerList from './PlayerList';

// import styles
import '../styles/Team.css';

export default function Team(props) {

  const dbUser = props.dbUser;
  const currentEditTeam = props.currentEditTeam;

  // set state
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerFirstName, setNewPlayerFirstName] = useState('');
  const [newPlayerLastName, setNewPlayerLastName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [formError, setFormError] = useState({
    isError: false,
    message: '',
    type: '',
  })

  const unsavedChanges = dbUser.teams[currentEditTeam].unsavedChanges;

  const setUnsaved = (value) => {
    let newDbUser = { ...dbUser };
    newDbUser.teams[currentEditTeam].unsavedChanges = value;
    props.setDbUser(newDbUser);
  }

  const sortOrderOptions = [
    { value: 'Number', label: 'Number' },
    { value: 'First Name', label: 'First Name' },
    { value: 'Last Name', label: 'Last Name' }
  ];

  const rsStyles = {
    container: (provided) => ({
      ...provided,
      'minWidth': '140px',
    })
  }

  // helper functions
  const addPlayer = (e) => {
    e.preventDefault();
    // reset the error messages
    resetFormError();
    let newFormError = { ...formError };
    // set error for number field
    if (parseInt(newPlayerNumber) < 0 || parseInt(newPlayerNumber) > 999) {
      newFormError.isError = true;
      newFormError.type = 'addPlayer';
      newFormError.message = 'Jersey # must be between 0 - 999';
      setFormError(newFormError);
      return;
    };
    // set error for name fields
    if (!newPlayerFirstName || !newPlayerLastName) {
      newFormError.isError = true;
      newFormError.type = 'addPlayer';
      newFormError.message = 'Must provide first and last name';
      setFormError(newFormError);
      return;
    }
    let playerID = uuid();
    const newPlayer = {
      firstName: newPlayerFirstName,
      lastName: newPlayerLastName,
      number: newPlayerNumber,
      playerID: playerID,
    }
    let newDbUser = { ...dbUser };
    newDbUser.teams[currentEditTeam].players[`${playerID}`] = newPlayer;
    newDbUser.teams[currentEditTeam].unsavedChanges = true;
    props.setDbUser(newDbUser);
    setNewPlayerFirstName('');
    setNewPlayerLastName('');
    setNewPlayerNumber('');
    setShowAddPlayer(false);
  }

  const delTeam = (e) => {
    let teamName = dbUser.teams[`${currentEditTeam}`].name;
    if (window.confirm(`Delete Team (${teamName})?`)) {
      // remove team from state
      let newDbUser = { ...dbUser };
      delete newDbUser.teams[`${currentEditTeam}`];
      props.setDbUser(newDbUser);
      props.setShowEditTeam(false);
      props.setCurrentEditTeam(null);
      // update the teamOptions and gameOptions
      props.resetTeamOptions(newDbUser.teams);
      // update the DB
      db.delTeam(newDbUser.uid, currentEditTeam);
      // redirect to the teams page after delete
      window.location.href = '/#/teams';
    }
  }

  const handleInputChange = (e) => {
    e.preventDefault();
    let newDbUser = { ...dbUser };
    switch (e.target.name) {
      case 'team-name':
        newDbUser.teams[currentEditTeam].name = e.target.value;
        newDbUser.teams[currentEditTeam].unsavedChanges = true;
        props.setDbUser(newDbUser);
        break;
      case 'player-number':
        setNewPlayerNumber(e.target.value)
        break;
      case 'player-first-name':
        setNewPlayerFirstName(e.target.value)
        break;
      case 'player-last-name':
        setNewPlayerLastName(e.target.value)
        break;
      default:
        console.log('State not updated!');
    }
  }

  const handleSortChange = (newValue) => {
    let newDbUser = { ...dbUser };
    newDbUser.teams[currentEditTeam].playerSortOrder = newValue.value;
    newDbUser.teams[currentEditTeam].unsavedChanges = true;
    props.setDbUser(newDbUser);
  }

  const resetFormError = () => {
    setFormError({ isError: false, message: '', type: '' })
  }

  const addFormError = () => {
    let newFormError = { ...formError };
    newFormError.isError = true;
    setFormError(newFormError);
  }

  const saveChanges = () => {
    if (!unsavedChanges) return;
    props.setShowEditTeam(false);
    setUnsaved(false);
    let newTeam = { ...dbUser.teams[currentEditTeam] };
    db.saveTeam(dbUser.uid, newTeam, newTeam.teamID);
  }

  return (
    <>
      {dbUser &&
        <>
          <div className='team-title-container'>
            <input
              className='team-name-input'
              name={'team-name'}
              value={dbUser.teams[currentEditTeam].name}
              onChange={handleInputChange}
            />
          </div>
          <div className='team-btns'>
            <button className='btn btn-del' onClick={delTeam}>Delete</button>
            <button className={unsavedChanges ? 'btn' : 'btn btn-inactive'} onClick={saveChanges}>Save Changes</button>
            <button className='btn' onClick={() => {
              props.setShowEditTeam(false)
            }}>Cancel</button>
          </div>
          <h2>Team Roster</h2>
          <form className='add-player-form'>
            {showAddPlayer &&
              <>
                <input type='number' className='player-input player-num-input' placeholder='##' name='player-number' onChange={handleInputChange} value={newPlayerNumber} />
                <input className='player-input' name='player-first-name' placeholder='First Name' onChange={handleInputChange} value={newPlayerFirstName} />
                <input className='player-input' name='player-last-name' placeholder='Last Name' onChange={handleInputChange} value={newPlayerLastName} />
                {formError.type === 'addPlayer' &&
                  <div className='form-error'>{formError.message}</div>
                }
                <div className='add-player-btns'>
                  <button type='submit' className='btn' onClick={addPlayer}>Add</button>
                  <button className='btn nmt' onClick={() => {
                    setShowAddPlayer(false);
                    resetFormError();
                  }}>Cancel</button>
                </div>
              </>
            }
          </form>
          {!showAddPlayer &&
            <div className='player-list-options'>
              <button className='btn' onClick={() => setShowAddPlayer(true)}>Add Player</button>
              <div className='sort-select'>
                <span>Sort</span>
                <Select
                  defaultValue={{
                    value: dbUser.teams[currentEditTeam].playerSortOrder,
                    label: dbUser.teams[currentEditTeam].playerSortOrder,
                  }}
                  isSearchable={false}
                  onChange={handleSortChange}
                  options={sortOrderOptions}
                  styles={rsStyles}
                />
              </div>
            </div>
          }
          <div className='player-list'>
            <div className='player-list-item player-list-headers'>
              <div className='player-num-header'>##</div>
              <div className='player-name-header'>First Name</div>
              <div className='player-name-header'>Last Name</div>
              <div className='i-placeholder'></div>
            </div>
            <PlayerList
              addFormError={addFormError}
              currentEditTeam={currentEditTeam}
              dbUser={dbUser}
              formError={formError}
              setDbUser={props.setDbUser}
              setUnsaved={setUnsaved}
              players={dbUser.teams[currentEditTeam].players}
            />
          </div>
        </>
      }
    </>
  )
}