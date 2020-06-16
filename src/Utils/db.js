import firebase, { firestore } from 'firebase/app';
import { toast } from 'react-toastify';

import { db } from '../App';

export function delTeam(userID, teamID) {
  db.collection('users').doc(userID)
    .update({
      [`teams.${teamID}`]: firebase.firestore.FieldValue.delete()
    })
    .then(() => {
      console.log('Team Deleted');
      // Toast for successful delete
      toast.error('Team Deleted');
    })
    .catch(e => console.log('Error deleting team', e))
}

export function saveTeam (userID, newTeam, teamID) {
  // update the User in the db from local state
  db.collection('users').doc(userID)
    .update({
      [`teams.${teamID}`]: newTeam
    })
    .then(() => {
      console.log('Teams Updated')
      // Toast msg for successful save
      toast.success('Team Saved');
    })
    .catch(e => console.log('Error updating teams', e))
}

export function addOpponent (userID, teamID, opponent) {
  db.collection('users').doc(userID)
    .update({
      opponents: firestore.FieldValue.arrayUnion(opponent)
    })
    .then(() => {
      console.log('New Opponent Added');
      toast.success('New Opponenet Added')
    })
    .catch(e => console.log('Error adding opponent', e));
}

export function addGame (game) {
  db.collection('users').doc(game.createdBy).collection('games')
    .add(game)
    .then(_ => {
      console.log('New game added');
      toast.success('New game added to the database');
    })
    .catch(e => console.log('Error adding game', e));
}
