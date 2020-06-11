import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import Select from 'react-select';

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

  const sortOrderOptions = [
    {value:'Number', label:'Number'},
    {value:'First Name', label:'First Name'},
    {value:'Last Name', label:'Last Name'}
  ];

  const rsStyles = {
    container: (provided) => ({
      ...provided,
      'min-width': '140px',
    })
  }

  // helper functions
  const addPlayer = () => {
    let playerID = uuid();
    const newPlayer = {
      firstName: newPlayerFirstName,
      lastName: newPlayerLastName,
      number: newPlayerNumber,
      playerID: playerID,
    }
    let newDbUser = { ...dbUser };
    newDbUser.teams[currentEditTeam].players[`${playerID}`] = newPlayer;
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
      // update the DB
      props.delTeam(currentEditTeam);
      // redirect to the teams page adter delete
      window.location.href = '/#/teams';
    }
  }

  const handleInputChange = (e) => {
    e.preventDefault();
    let newDbUser = { ...dbUser };
    switch (e.target.name) {
      case 'team-name':
        newDbUser.teams[currentEditTeam].name = e.target.value;
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
    console.log(newValue)
    let newDbUser = { ...dbUser };
    newDbUser.teams[currentEditTeam].playerSortOrder = newValue.value;
    props.setDbUser(newDbUser);
  }

  const saveChanges = () => {
    props.setShowEditTeam(false);
    let newTeam = { ...dbUser.teams[currentEditTeam] };
    props.saveTeam(newTeam, newTeam.teamID);
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
                <input className='player-input' name='player-first-name' placeholder='First Name' onChange={handleInputChange} value={newPlayerFirstName} />
                <input className='player-input' name='player-last-name' placeholder='Last Name' onChange={handleInputChange} value={newPlayerLastName} />
                <div className='add-player-btns'>
                  <button type='submit' className='btn' onClick={addPlayer}>Add</button>
                  <button className='btn nmt' onClick={() => setShowAddPlayer(false)}>Cancel</button>
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
                {/* <select
                  className='player-input'
                  name='sort-order'
                  value={dbUser.teams[currentEditTeam].playerSortOrder}
                  onChange={handleSortChange}
                >{sortOrderOptions}</select> */}
              </div>
            </div>
          }
          <div className='player-list'>
            <PlayerList
              currentEditTeam={currentEditTeam}
              dbUser={dbUser}
              setDbUser={props.setDbUser}
              players={dbUser.teams[currentEditTeam].players}
            />
          </div>
        </>
      }
    </>
  )
}