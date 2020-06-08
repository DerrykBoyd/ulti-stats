import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

// import styles
import '../styles/Team.css';

const PlayerList = (props) => {

    const deletePlayer = (index) => {
        let newDbUser = { ...props.dbUser };
        newDbUser.teams[props.currentEditTeam].players.splice(index, 1);
        props.setDbUser(newDbUser);
    }

    const handlePlayerChange = (index, e) => {
        e.preventDefault();
        let newDbUser = { ...props.dbUser };
        switch (e.target.name) {
            case 'player-number':
                newDbUser.teams[props.currentEditTeam].players[index].number = e.target.value;
                props.setDbUser(newDbUser)
                break;
            case 'player-first-name':
                newDbUser.teams[props.currentEditTeam].players[index].firstName = e.target.value;
                props.setDbUser(newDbUser)
                break;
            case 'player-last-name':
                newDbUser.teams[props.currentEditTeam].players[index].lastName = e.target.value;
                props.setDbUser(newDbUser)
                break;
            default:
                console.log('State not updated!');
        }
    }

    return (
        props.players.map((player, index) => (
            <form
                className='player-list-item'
                key={index}
            >
                <input
                    className='player-num-input'
                    name='player-number'
                    value={props.dbUser.teams[props.currentEditTeam].players[index].number}
                    onChange={(e) => handlePlayerChange(index, e)}
                />
                <input
                    className='player-name-input'
                    name='player-first-name'
                    placeholder='First Name'
                    value={props.dbUser.teams[props.currentEditTeam].players[index].firstName || ''}
                    onChange={(e) => handlePlayerChange(index, e)}
                />
                <input
                    className='player-name-input'
                    name='player-last-name'
                    placeholder='Last Name'
                    value={props.dbUser.teams[props.currentEditTeam].players[index].lastName || ''}
                    onChange={(e) => handlePlayerChange(index, e)}
                />
                <i
                    className='material-icons text-del'
                    onClick={() => {
                        if (window.confirm(`Delete Player (${player.firstName} ${player.lastName})`)) {
                            deletePlayer(index);
                        }
                    }}
                >delete</i>
            </form>
        ))
    )
}

export default function Team(props) {

    const dbUser = props.dbUser;

    // set state
    const [showAddPlayer, setShowAddPlayer] = useState(false);
    const [newPlayerFirstName, setNewPlayerFirstName] = useState('');
    const [newPlayerLastName, setNewPlayerLastName] = useState('');
    const [newPlayerNumber, setNewPlayerNumber] = useState('');

    // helper functions
    const addPlayer = () => {
        const newPlayer = {
            uid: uuid(),
            firstName: newPlayerFirstName,
            lastName: newPlayerLastName,
            number: newPlayerNumber
        }
        let newDbUser = { ...dbUser };
        newDbUser.teams[props.currentEditTeam].players.unshift(newPlayer);
        props.setDbUser(newDbUser);
        setNewPlayerFirstName('');
        setNewPlayerLastName('');
        setNewPlayerNumber('');
        setShowAddPlayer(false);
    }

    const delTeam = (e) => {
        // remove team from state
        let newDbUser = { ...dbUser };
        let newTeams = [...dbUser.teams];
        let teamInd = props.currentEditTeam;
        newTeams.splice(teamInd, 1);
        newDbUser.teams = newTeams;
        props.setDbUser(newDbUser);
        props.setShowEditTeam(false);
        props.setCurrentEditTeam(null);
        // update the DB
        props.saveTeams(newTeams);
        // redirect to the teams page adter delete
        window.location.href = '/#/teams';
    }

    const handleInputChange = (e) => {
        e.preventDefault();
        let newDbUser = { ...dbUser };
        switch (e.target.name) {
            case 'team-name':
                newDbUser.teams[props.currentEditTeam].name = e.target.value;
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

    const saveChanges = () => {
        props.setShowEditTeam(false);
        let newTeams = [...dbUser.teams];
        props.saveTeams(newTeams);
    }

    return (
        <>
            {dbUser &&
                <>
                    <div className='team-title-container'>
                        <input
                            className='team-name-input'
                            name={'team-name'}
                            value={dbUser.teams[props.currentEditTeam].name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className='team-btns'>
                        <button className='btn btn-del' onClick={delTeam}>Delete</button>
                        <button className='btn' onClick={saveChanges}>Save Changes</button>
                        <button className='btn' onClick={() => {
                            props.setShowEditTeam(false)
                        }}>Cancel</button>
                    </div>
                    <h2>Team Roster</h2>
                    <form className='add-player-form'>
                        {showAddPlayer &&
                            <>
                                <input className='player-num-input' placeholder='##' name='player-number' onChange={handleInputChange} value={newPlayerNumber} />
                                <input name='player-first-name' placeholder='First Name' onChange={handleInputChange} value={newPlayerFirstName} />
                                <input name='player-last-name' placeholder='Last Name' onChange={handleInputChange} value={newPlayerLastName} />
                                <div className='add-player-btns'>
                                    <button type='submit' className='btn' onClick={addPlayer}>Add</button>
                                    <button className='btn nmt' onClick={() => setShowAddPlayer(false)}>Cancel</button>
                                </div>
                            </>
                        }
                    </form>
                    {!showAddPlayer && <button className='btn' onClick={() => setShowAddPlayer(true)}>Add Player</button>}
                    <div className='player-list'>
                        <PlayerList
                            currentEditTeam={props.currentEditTeam}
                            dbUser={dbUser}
                            setDbUser={props.setDbUser}
                            players={dbUser.teams[props.currentEditTeam].players}
                        />
                    </div>
                </>
            }
        </>
    )
}