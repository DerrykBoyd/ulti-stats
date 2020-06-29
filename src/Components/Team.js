import React, { useState } from 'react';
import Select from 'react-select';
import { useParams, useHistory } from 'react-router-dom';

// helper functions
import * as dbUtils from '../Utils/db';
import { sortOrderOptions } from '../Utils/utils';

// Components
import ErrorPage from './ErrorPage';
import PlayerList from './PlayerList';

// import styles
import '../styles/Team.css';
import AddPlayerForm from './AddPlayerForm';
import { toast } from 'react-toastify';

export default function Team(props) {

  const dbUser = props.dbUser;
  const currentEditTeam = useParams().teamID;
  const teamExists = Object.keys(dbUser.teams).includes(currentEditTeam);

  let history = useHistory();

  // set state
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [formError, setFormError] = useState({ message: '' });
  const [newTeamName, setNewTeamName] = useState(teamExists ? dbUser.teams[currentEditTeam].name : '');

  const unsavedChanges = teamExists ? dbUser.teams[currentEditTeam].unsavedChanges : null;

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
      // update the teamOptions and gameOptions
      props.resetTeamOptions(newDbUser.teams);
      // update the DB
      dbUtils.delTeam(newDbUser.uid, currentEditTeam);
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
    setUnsaved(false);
    // update the team name in state
    let newDbUser = { ...dbUser };
    newDbUser.teams[currentEditTeam].name = newTeamName;
    props.setDbUser(newDbUser);
    // save changes to the database
    let newTeam = { ...dbUser.teams[currentEditTeam] };
    newTeam.name = newTeamName;
    dbUtils.saveTeam(dbUser.uid, newTeam, newTeam.teamID);
  }

  return (
    <>
      {teamExists ?
        <div className={`App App-flex btm-nav-page ${props.currentGame ? 'pad-btm-alert' : ''}`}>
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
              <div className='btn-container'>
                <button className='btn btn-del' onClick={delTeam}>Delete</button>
                <button className={unsavedChanges ? 'btn btn-green' : 'btn btn-inactive-text'} onClick={saveChanges}>Save Changes</button>
                <button className='btn btn-primary' onClick={() => history.goBack()}>Back</button>
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
                  <button className='btn btn-primary' onClick={() => setShowAddPlayer(true)}>Add Player</button>
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
        </div>
        :
        <ErrorPage />}
    </>
  )
}