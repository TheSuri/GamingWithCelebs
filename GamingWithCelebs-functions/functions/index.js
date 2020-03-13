const functions = require('firebase-functions');
// const firebaseConfig = require('./util/config');
const app = require('express')();

const FBAuth = require('./util/fbauth');

const { getAllMatchRequests, postMatchRequest } = require('./handlers/matchrequests');

const { signup, login } = require('./handlers/users');



// // Initialize Firebase
// const firebase = require('firebase');
// firebase.initializeApp(firebaseConfig);

//MatchRequests routes
app.get('/matchrequests', getAllMatchRequests);
app.post('/matchrequest', FBAuth, postMatchRequest);

//User routes
app.post('/signup', signup);
app.post('/login', login);


// https://baseurl.com/api/whateverendpoint
exports.api = functions.https.onRequest(app);