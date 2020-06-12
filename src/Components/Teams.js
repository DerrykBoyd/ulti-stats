import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

import * as db from '../Utils/db';

import '../styles/Teams.css';

import TeamCards from './TeamCards';
import Team from './Team';

export default function Teams(props) {

  const dbUser = props.dbUser;

  // set state
  const [teamName, setTeamName] = useState('');
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [currentEditTeam, setCurrentEditTeam] = useState(null);

  const addTeam = (e) => {
    e.preventDefault();
    setShowAddTeam(false);
    // add team to state
    let newDbUser = { ...dbUser };
    let teamID = uuid();
    let newTeam = {
      createdOn: new Date(),
      name: teamName,
      players: {},
      playerSortOrder: 'Number',
      teamID: teamID,
    }
    newDbUser.teams[`${teamID}`] = newTeam;
    props.setDbUser(newDbUser);
    props.resetTeamOptions(newDbUser.teams);
    setTeamName('');
    // add team to DB
    db.saveTeam(newDbUser.uid, newTeam, teamID);
  }

  const handleInputChange = (e) => {
    switch (e.target.name) {
      case 'team-name':
        setTeamName(e.target.value);
        break;
      default:
        console.log('State not updated!');
    }
  }

  return (
    <div className='App teams-main'>
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
                    <label htmlFor='team-name'>Team Name: </label>
                    <input className='player-input' name='team-name' onChange={handleInputChange} value={teamName} />
                    <div>
                      <button className='btn' onClick={addTeam}>Save</button>
                      <button className='btn nmt' onClick={() => setShowAddTeam(false)}>Cancel</button>
                    </div>
                  </>
                }
              </form>
              <TeamCards
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