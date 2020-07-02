import firebase, { firestore } from 'firebase/app';
import { toast } from 'react-toastify';

import { db } from '../App';

export function addOpponent(userID, opponent) {
  db.collection('users').doc(userID)
    .update({
      opponents: firestore.FieldValue.arrayUnion(opponent)
    })
    .then(() => {
      console.log('Opponent added to database');
      toast.success('New Opponenet Added')
    })
    .catch(e => console.error('Error adding opponent', e));
}

export function delGame(game) {
  db.collection('users').doc(game.createdBy).collection('games')
    .doc(game.gameID)
    .delete()
    .then(() => {
      console.log('Game deleted');
      toast.error('Game deleted form the database');
    })
    .catch(e => console.log('Error deleting game', e));
}

export function delTeam(userID, teamID) {
  db.collection('users').doc(userID)
    .update({
      [`teams.${teamID}`]: firebase.firestore.FieldValue.delete()
    })
    .then(() => {
      console.log('Team deleted from database');
      // Toast for successful delete
      toast.error('Team Deleted');
    })
    .catch(e => console.error('Error deleting team', e))
}

export function saveGame(game) {
  db.collection('users').doc(game.createdBy).collection('games')
    .doc(game.gameID)
    .set(game)
    .then(_ => {
      console.log('Game saved');
      toast.success('Game saved to the database');
    })
    .catch(e => console.error('Error saving game', e));
}

export function saveTeam(userID, newTeam, teamID) {
  // update the User in the db from local state
  db.collection('users').doc(userID)
    .update({
      [`teams.${teamID}`]: newTeam
    })
    .then(() => {
      console.log('Team saved to database')
      // Toast msg for successful save
      toast.success('Team Saved');
    })
    .catch(e => console.error('Error updating teams', e))
}
