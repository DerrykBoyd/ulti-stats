import React, { useState } from 'react';
import Select from 'react-select';

// helper functions
import * as db from '../Utils/db';
import {sortOrderOptions} from '../Utils/utils';

// Components
import PlayerList from './PlayerList';

// import styles
import '../styles/Team.css';
import AddPlayerForm from './AddPlayerForm';
import { toast } from 'react-toastify';

export default function Team(props) {

  const dbUser = props.dbUser;
  const currentEditTeam = props.currentEditTeam;

  // set state
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [formError, setFormError] = useState({ message: '' });
  const [newTeamName, setNewTeamName] = useState(dbUser.teams[currentEditTeam].name);

  const unsavedChanges = dbUser.teams[currentEditTeam].unsavedChanges;

  const setUnsaved = (value) => {
    let newDbUser = { ...dbUser };
    newDbUser.teams[currentEditTeam].unsavedChanges = value;
    props.setDbUser(newDbUser);
  }

  const rsStyles = {
    container: (provided) => ({
      ...provided,
      'minWidth': '140px',
    })
  }

  // helper functions
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

  const handleTeamNameChange = (e) => {
    e.preventDefault();
    setFormError({ message: '' });
    setNewTeamName(e.target.value);
    setUnsaved(true);
    if (!e.target.value) {
      setFormError({ message: 'Name cannot be blank.' });
    }
  }

  const handleSortChange = (newValue) => {
    let newDbUser = { ...dbUser };
    newDbUser.teams[currentEditTeam].playerSortOrder = newValue.value;
    newDbUser.teams[currentEditTeam].unsavedChanges = true;
    props.setDbUser(newDbUser);
  }

  const saveChanges = () => {
    if (!unsavedChanges) return;
    if (formError.message) {
      toast.error('Please fix form errors before saving.');
      return;
    }
    props.setShowEditTeam(false);
    setUnsaved(false);
    // update the team name in state
    let newDbUser = {...dbUser};
    newDbUser.teams[currentEditTeam].name = newTeamName;
    props.setDbUser(newDbUser);
    // save changes to the database
    let newTeam = { ...dbUser.teams[currentEditTeam] };
    newTeam.name = newTeamName;
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
              value={newTeamName}
              onChange={handleTeamNameChange}
            />
          </div>
          {formError.message && <div className='form-error'>{formError.message}</div>}
          <div className='team-btns'>
            <button className='btn btn-del' onClick={delTeam}>Delete</button>
            <button className={unsavedChanges ? 'btn' : 'btn btn-inactive'} onClick={saveChanges}>Save Changes</button>
            <button className='btn' onClick={() => {
              props.setShowEditTeam(false)
            }}>Cancel</button>
          </div>
          <h2>Team Roster</h2>
          {showAddPlayer ?
            <AddPlayerForm
              currentEditTeam={currentEditTeam}
              dbUser={dbUser}
              setDbUser={props.setDbUser}
              setShowAddPlayer={setShowAddPlayer}
            />
            :
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
              currentEditTeam={currentEditTeam}
              dbUser={dbUser}
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