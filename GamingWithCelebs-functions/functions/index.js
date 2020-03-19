const functions = require('firebase-functions');
// const firebaseConfig = require('./util/config');
const app = require('express')();

const {FBAuth, checkCelebrity} = require('./util/middleware');

const { getAllMatchRequests, postMatchRequest } = require('./handlers/matchrequests');

const { signup, signupuser, signupcelebrity, login, uploadImage } = require('./handlers/users');

const { postGameListing } = require('./handlers/gamelistings');

//MatchRequests routes
app.get('/matchrequests', getAllMatchRequests);
app.post('/matchrequest', FBAuth, postMatchRequest);

//signup routes
app.post('/signupuser', signup, signupuser);
app.post('/signupcelebrity', signup, signupcelebrity);

app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
//app.post('user/', FBAuth, addUserDetails);

// Celebrity routes
app.post('/gamelisting', [FBAuth, checkCelebrity], gamelisting);


// https://baseurl.com/api/whateverendpoint
exports.api = functions.https.onRequest(app);