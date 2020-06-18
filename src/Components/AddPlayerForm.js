import React, {useState} from 'react';
import { v4 as uuid } from 'uuid';

import * as db from '../Utils/db';

export default function AddPlayerForm(props) {

  const [newPlayerFirstName, setNewPlayerFirstName] = useState('');
  const [newPlayerLastName, setNewPlayerLastName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [formError, setFormError] = useState({
    isError: false,
    message: '',
    type: '',
  })

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
    let newDbUser = { ...props.dbUser };
    newDbUser.teams[props.currentEditTeam].players[`${playerID}`] = newPlayer;
    if (props.saveToDb) {
      db.saveTeam(newDbUser.uid, newDbUser.teams[props.currentEditTeam], props.currentEditTeam);
    }
    newDbUser.teams[props.currentEditTeam].unsavedChanges = true;
    props.setDbUser(newDbUser);
    setNewPlayerFirstName('');
    setNewPlayerLastName('');
    setNewPlayerNumber('');
    props.setShowAddPlayer(false);
  }

  const handleInputChange = (e) => {
    e.preventDefault();
    switch (e.target.name) {
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

  const resetFormError = () => {
    setFormError({ isError: false, message: '', type: '' })
  }

  return (
    <div className='add-player-form'>
        <input type='number' className='player-input player-num-input' placeholder='##' name='player-number' onChange={handleInputChange} value={newPlayerNumber} />
        <input className='player-input' name='player-first-name' placeholder='First Name' onChange={handleInputChange} value={newPlayerFirstName} />
        <input className='player-input' name='player-last-name' placeholder='Last Name' onChange={handleInputChange} value={newPlayerLastName} />
        {formError.type === 'addPlayer' &&
          <div className='form-error'>{formError.message}</div>
        }
        <div className='add-player-btns'>
          <button type='submit' className='btn' onClick={addPlayer}>Add</button>
          <button className='btn nmt' onClick={() => {
            props.setShowAddPlayer(false);
            resetFormError();
          }}>Cancel</button>
        </div>
  </div>
  )
}
