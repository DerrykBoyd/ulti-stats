import firebase, { firestore } from 'firebase/app';
import { toast } from 'react-toastify';

import { db } from '../App';

// can use async when called
export async function addOpponent(userID, opponent) {
  return db.collection('users').doc(userID)
    .update({
      opponents: firestore.FieldValue.arrayUnion(opponent)
    })
    .then(() => {
      console.log('Opponent added to database');
      toast.success('New Opponenet Added')
    })
    .catch(e => console.error('Error adding opponent', e));
}

// can also setup like this with async await
export async function delGame(game) {
  try {
    await db.collection('users').doc(game.createdBy).collection('games')
      .doc(game.gameID)
      .delete();
    console.log('Game deleted');
    toast.error('Game deleted form the database');
  }
  catch (e) {
    return console.log('Error deleting game', e);
  }
}

export async function delTeam(userID, teamID) {
  try {
    await db.collection('users').doc(userID)
      .update({
        [`teams.${teamID}`]: firebase.firestore.FieldValue.delete()
      });
    console.log('Team deleted from database');
    // Toast for successful delete
    toast.error('Team Deleted');
  }
  catch (e) {
    return console.error('Error deleting team', e);
  }
}

export async function saveGame(game) {
  try {
    await db.collection('users').doc(game.createdBy).collection('games')
      .doc(game.gameID)
      .set(game);
    console.log('Game saved');
    toast.success('Game saved to the database');
  }
  catch (e) {
    return console.error('Error saving game', e);
  }
}

export async function saveTeam(userID, newTeam, teamID) {
  try {
    await db.collection('users').doc(userID)
      .update({
        [`teams.${teamID}`]: newTeam
      });
    console.log('Team saved to database');
    toast.success('Team Saved');
  }
  catch (e) {
    return console.error('Error updating teams', e);
  }
}

export async function updateUser(userID, newUser) {
  try {
    await db.collection('users').doc(userID)
      .set(newUser);
    console.log('Database user doc updated');
    toast.success('User saved to database');
  }
  catch (e) {
    return console.error('Error updating user', e);
  }
}
