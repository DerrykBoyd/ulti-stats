import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

import * as db from '../Utils/db';

import '../styles/Teams.css';

import TeamCards from './TeamCards';
import Team from './Team';
import { toast } from 'react-toastify';

export default function Teams(props) {

  const dbUser = props.dbUser;

  // set state
  const [teamName, setTeamName] = useState('');
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [currentEditTeam, setCurrentEditTeam] = useState(null);
  const [formErr, setFormErr] = useState({});

  const validateUnique = (teamName) => {
    // Check team names for a duplicate
    for (let team of Object.values(dbUser.teams)) {
      if (team.name === teamName) return false;
    }
    return true;
  }

  const addTeam = (e) => {
    e.preventDefault();
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
    props.resetTeamOptions(newDbUser.teams);
    setTeamName('');
    // add team to DB
    db.saveTeam(newDbUser.uid, newTeam, teamID);
  }

  const handleInputChange = (e) => {
    setFormErr({});
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
    <div className={`App teams-main ${props.currentGame && 'pad-btm-alert'}`}>
      {dbUser &&
        <>
          {!showEditTeam &&
            <>
              <h1>My Teams</h1>
              {!showAddTeam &&
                <button className='btn' onClick={() => setShowAddTeam(true)}>Add Team</button>
              }
              <form className='add-team-form' onSubmit={addTeam}>
                {showAddTeam &&
                  <>
                    <div>
                      <label htmlFor='team-name'>Team Name: </label>
                      <input className='player-input' name='team-name' onChange={handleInputChange} value={teamName} />
                    </div>
                    {formErr.message && <div className='form-error'>{formErr.message}</div>}
                    <div>
                      {formErr.message ?
                        <button className='btn btn-inactive' onClick={addTeam}>Save</button>
                        :
                        <button className='btn' onClick={addTeam}>Save</button>}
                      <button className='btn nmt' onClick={() => {
                        setFormErr({});
                        setTeamName('');
                        setShowAddTeam(false);
                      }}>Cancel</button>
                    </div>
                  </>
                }
              </form>
              <TeamCards
                currentGame={props.currentGame}
                teamList={dbUser.teams}
                setCurrentEditTeam={setCurrentEditTeam}
                setShowEditTeam={setShowEditTeam}
              />
            </>
          }
          {showEditTeam &&
            <Team
              currentEditTeam={currentEditTeam}
              db={props.db}
              dbUser={dbUser}
              resetTeamOptions={props.resetTeamOptions}
              setCurrentEditTeam={setCurrentEditTeam}
              setDbUser={props.setDbUser}
              setShowEditTeam={setShowEditTeam}
            />
          }
        </>
      }
    </div>
  )
}