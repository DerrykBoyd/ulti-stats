const functions = require('firebase-functions');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.createUserRecord = functions.auth.user().onCreate((user) => {

    const userRecord = {
        email: user.email,
        uid: user.uid,
        creationTime: user.metadata.creationTime,
        teams: [],
    }

    return admin.firestore().collection('users').doc(user.uid).set(userRecord);

})

exports.deleteUserRecord = functions.auth.user().onDelete((user) => {

    return admin.firestore().collection('users').doc(user.uid).delete();

})