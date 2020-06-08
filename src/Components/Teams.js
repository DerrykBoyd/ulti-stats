import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

import '../styles/Teams.css';

import Team from './Team';

const TeamCards = (props) => {

    const teams = props.teamList.map((team, ind) =>
        <div
            className='card team-card'
            key={ind}
            ind={ind}
        >
            <h2>{team.name}</h2>
            <button className='btn' onClick={() => {
                props.setCurrentEditTeam(ind);
                props.setShowEditTeam(true);
            }}>Edit</button>
        </div>
    );
    return (
        <div className='team-list'>{teams}</div>
    )
}

export default function Teams(props) {

    const db = props.db;
    const dbUser = props.dbUser;
    const localUser = JSON.parse(localStorage.getItem('user'));
    const dbUserRef = db.collection('users').doc(localUser.uid);

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
        newDbUser.teams.unshift({
            uid: uuid(),
            name: teamName,
            players: []
        });
        props.setDbUser(newDbUser);
        setTeamName('');
        // add team to DB
        props.saveTeams(newDbUser.teams);
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
                            {showAddTeam &&
                                <form className='add-team-form' onSubmit={addTeam}>
                                    <label htmlFor='team-name'>Team Name: </label>
                                    <input name='team-name' onChange={handleInputChange} value={teamName} />
                                    <div>
                                        <button className='btn' onClick={addTeam}>Save</button>
                                        <button className='btn nmt' onClick={() => setShowAddTeam(false)}>Cancel</button>
                                    </div>
                                </form>
                            }
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
                            db={db}
                            dbUser={dbUser}
                            saveTeams={props.saveTeams}
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