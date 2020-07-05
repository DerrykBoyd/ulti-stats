import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function PlayerListItem(props) {

  // make a copy of the player object for changes
  let newPlayer = { ...props.player };

  const [editing, setEditing] = useState(false);
  const [playerFormError, setPlayerFormError] = useState({
    message: '',
  });
  const [newNumber, setNewNumber] = useState(newPlayer.number);
  const [newFirstName, setNewFirstName] = useState(newPlayer.firstName);
  const [newLastName, setNewLastName] = useState(newPlayer.lastName);


  const handlePlayerChange = (playerID, e) => {
    e.preventDefault();
    setPlayerFormError({ message: '' })
    switch (e.target.name) {
      case 'player-number':
        // validate input
        if (parseInt(e.target.value) < 0 || parseInt(e.target.value) > 999) {
          setPlayerFormError({
            message: 'Jersey # must be between 0 - 999',
          });
        };
        setNewNumber(e.target.value);
        break;
      case 'player-first-name':
        // validate input
        if (!e.target.value) {
          setPlayerFormError({
            message: 'Name fields cannot be blank',
          });
        };
        setNewFirstName(e.target.value);
        break;
      case 'player-last-name':
        // validate input
        if (!e.target.value) {
          setPlayerFormError({
            message: 'Name fields cannot be blank',
          });
        };
        setNewLastName(e.target.value);
        break;
      default:
        console.log('State not updated!');
    }
  }

  const resetForm = () => {
    setNewNumber(props.player.number);
    setNewFirstName(props.player.firstName);
    setNewLastName(props.player.lastName);
    setPlayerFormError({ message: '' })
  }

  const updatePlayer = (playerID) => {
    if (playerFormError.message) {
      toast.error('Please correct all form errors')
      return;
    }
    let newDbUser = { ...props.dbUser };
    newDbUser.teams[`${props.currentEditTeam.teamID}`].players[`${playerID}`].number = newNumber;
    newDbUser.teams[`${props.currentEditTeam.teamID}`].players[`${playerID}`].firstName = newFirstName;
    newDbUser.teams[`${props.currentEditTeam.teamID}`].players[`${playerID}`].lastName = newLastName;
    props.setDbUser(newDbUser);
    setEditing(false);
    props.setUnsaved(true);
  }

  return (
    <>
      {!editing &&
        <div className='player-list-item'>
          <div className='player-num-header'>{props.player.number}</div>
          <div className='player-name-header'>{props.player.firstName}</div>
          <div className='player-name-header'>{props.player.lastName}</div>
          <i
            className='material-icons text-primary-dark point'
            onClick={() => setEditing(true)}
          >edit</i>
        </div>
      }
      {editing &&
        <div className='player-list-form-container'>
          <form className='player-list-form'>
            <input
              className='player-num-input'
              name='player-number'
              onChange={e => {
                handlePlayerChange(props.player.playerID, e);
              }}
              type='number'
              value={newNumber}
            />
            <input
              className='player-name-input'
              name='player-first-name'
              onChange={(e) => handlePlayerChange(props.player.playerID, e)}
              placeholder='First Name'
              value={newFirstName}
            />
            <input
              className='player-name-input'
              name='player-last-name'
              onChange={(e) => handlePlayerChange(props.player.playerID, e)}
              placeholder='Last Name'
              value={newLastName}
            />
            <div className='i-placeholder'></div>
          </form>
          {editing && playerFormError.message && <div className='form-error'>{playerFormError.message}</div>}
          <div className='player-edit-btns btn-container'>
            <button
              className='btn btn-del'
              onClick={() => {
                if (window.confirm(`Delete Player (${props.player.firstName} ${props.player.lastName})`)) {
                  props.deletePlayer(props.player.playerID);
                }
              }}
            >Delete</button>
            <button
              className='btn btn-del-text'
              onClick={() => {
                setEditing(false);
                resetForm();
              }}
            >Cancel</button>
            <button
              className='btn btn-primary-text'
              onClick={() => {
                updatePlayer(props.player.playerID);
              }}
            >Done</button>
          </div>
        </div>
      }
    </>
  )
}
