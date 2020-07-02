import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';

import * as dbUtils from '../Utils/dbUtils';

import '../styles/Teams.css';

import TeamCards from './TeamCards';
import { toast } from 'react-toastify';

export default function Teams(props) {

  // set the page title
  useEffect(() => {
    document.title = `Ultimate Stats - ${props.title}`
  }, [props.title])

  const dbUser = props.dbUser;

  // set state
  const [teamName, setTeamName] = useState('');
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [formErr, setFormErr] = useState({});

  const validateUnique = (teamName) => {
    // Check team names for a duplicate
    for (let team of Object.values(dbUser.teams)) {
      if (team.name === teamName) return false;
    }
    return true;
  }

  const addTeam = () => {
    let newFormErr = { ...formErr };
    if (!teamName) {
      newFormErr = {
        message: 'Team name must be provided.',
        type: 'empty-form'
      }
      setFormErr(newFormErr);
    }
    if (newFormErr.message) {
      toast.error(formErr.message);
      return;
    };
    setShowAddTeam(false);
    // add team to state
    let newDbUser = { ...dbUser };
    let teamID = uuid();
    let newTeam = {
      createdOn: Date.now(),
      name: teamName,
      players: {},
      playerSortOrder: 'Number',
      teamID: teamID,
      unsavedChanges: false,
    }
    newDbUser.teams[`${teamID}`] = newTeam;
    props.setDbUser(newDbUser);
    setTeamName('');
    // add team to DB
    dbUtils.saveTeam(newDbUser.uid, newTeam, teamID);
  }

  const checkSubmit = (e) => {
    if (e.key === 'Enter') addTeam();
  }

  const handleInputChange = (e) => {
    setFormErr({});
    if (e.key === 'Enter') {
      addTeam();
      return;
    }
    if (!validateUnique(e.target.value)) {
      setFormErr({
        message: 'Team name already in use.',
        type: 'duplicate-name'
      })
    };
    switch (e.target.name) {
      case 'team-name':
        setTeamName(e.target.value);
        break;
      default:
        console.log('State not updated!');
    }
  }

  return (
    <div className={`App App-flex btm-nav-page ${props.currentGame ? 'pad-btm-alert' : ''}`}>
      {dbUser &&
        <>
          <h1>Teams</h1>
          {!showAddTeam &&
            <button className='btn btn-primary' onClick={() => setShowAddTeam(true)}>Add Team</button>
          }
          {showAddTeam &&
            <>
              <div className='add-team-form'>
                <span >Team Name: </span>
                <input
                  className='player-input'
                  name='team-name'
                  onChange={handleInputChange}
                  onKeyPress={checkSubmit}
                  value={teamName}
                />
              </div>
              {formErr.message && <div className='form-error'>{formErr.message}</div>}
              <div className='btn-container'>
                <button className='btn btn-del-text nmt' onClick={() => {
                  setFormErr({});
                  setTeamName('');
                  setShowAddTeam(false);
                }}>Cancel</button>
                {formErr.message ?
                  <button className='btn btn-inactive-text' onClick={addTeam}>Save</button>
                  :
                  <button className='btn btn-green-text' onClick={addTeam}>Save</button>}
              </div>
            </>
          }
          <TeamCards
            currentGame={props.currentGame}
            teamList={dbUser.teams}
          />
        </>
      }
    </div>
  )
}