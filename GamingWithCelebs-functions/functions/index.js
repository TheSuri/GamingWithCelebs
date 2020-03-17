const functions = require('firebase-functions');
// const firebaseConfig = require('./util/config');
const app = require('express')();

const FBAuth = require('./util/fbauth');

const { getAllMatchRequests, postMatchRequest } = require('./handlers/matchrequests');

const { signup, signupuser, signupcelebrity, login, uploadImage } = require('./handlers/users');


// // Initialize Firebase
// const firebase = require('firebase');
// firebase.initializeApp(firebaseConfig);

//MatchRequests routes
app.get('/matchrequests', getAllMatchRequests);
app.post('/matchrequest', FBAuth, postMatchRequest);

//signup routes
app.post('/signupuser', signup, signupuser);
app.post('/signupcelebrity', signup, signupcelebrity);

app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
//app.post('user/', FBAuth, addUserDetails);



// https://baseurl.com/api/whateverendpoint
exports.api = functions.https.onRequest(app);