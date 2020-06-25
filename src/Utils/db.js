import firebase, { firestore } from 'firebase/app';
import { toast } from 'react-toastify';

import { db } from '../App';

export function delTeam(userID, teamID) {
  db.collection('users').doc(userID)
    .update({
      [`teams.${teamID}`]: firebase.firestore.FieldValue.delete()
    })
    .then(() => {
      console.log('Team deleted from database');
      // Toast for successful delete
      toast.error('Team Deleted', {
        autoClose: 3000,
      });
    })
    .catch(e => console.error('Error deleting team', e))
}

export function saveTeam (userID, newTeam, teamID) {
  // update the User in the db from local state
  db.collection('users').doc(userID)
    .update({
      [`teams.${teamID}`]: newTeam
    })
    .then(() => {
      console.log('Team saved to database')
      // Toast msg for successful save
      toast.success('Team Saved', {
        autoClose: 3000,
      });
    })
    .catch(e => console.error('Error updating teams', e))
}

export function addOpponent (userID, teamID, opponent) {
  db.collection('users').doc(userID)
    .update({
      opponents: firestore.FieldValue.arrayUnion(opponent)
    })
    .then(() => {
      console.log('Opponent added to database');
      toast.success('New Opponenet Added', {
        autoClose: 3000,
      })
    })
    .catch(e => console.error('Error adding opponent', e));
}

export function addGame (game) {
  db.collection('users').doc(game.createdBy).collection('games')
    .doc(game.gameID)
    .set(game)
    .then(_ => {
      console.log('New game added to the database');
      toast.success('New game added to the database', {
        autoClose: 3000,
      });
    })
    .catch(e => console.error('Error adding game', e));
}

export function saveGame (game) {
  db.collection('users').doc(game.createdBy).collection('games')
    .doc(game.gameID)
    .set(game)
    .then(_ => {
      console.log('Game saved');
      toast.success('Game saved to the database', {autoClose: 3000});
    })
}

export function delGame (game) {
  db.collection('users').doc(game.createdBy).collection('games')
    .doc(game.gameID)
    .delete()
    .then(() => {
      console.log('Game deleted');
      toast.error('Game deleted form the database', {
        autoClose: 3000,
      });
    })
    .catch(e => console.log('Error deleting game', e));
}
