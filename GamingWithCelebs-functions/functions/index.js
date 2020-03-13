const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyAo53szaQMQhOD0oo6NBPH_K8gwowfXabU",
  authDomain: "gamingwithcelebs-97003.firebaseapp.com",
  databaseURL: "https://gamingwithcelebs-97003.firebaseio.com",
  projectId: "gamingwithcelebs-97003",
  storageBucket: "gamingwithcelebs-97003.appspot.com",
  messagingSenderId: "767909201995",
  appId: "1:767909201995:web:4ae4b7472659fc29caa5ce",
  measurementId: "G-RV2KZ3EB8B"
};
// Initialize Firebase
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();

//Firebase starter code
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   response.send("Hello World!");
//  });
 

app.get('/matchrequests', (req, res) => {
  db
  .collection('matchrequests')
  .orderBy('created', 'desc')
  .get()
  .then((data) => {
      let matchrequests = [];
      data.forEach((doc) => {
        matchrequests.push({
          matchRequestId: doc.id,
          ...doc.data()
        });
      });
      return res.json(matchrequests);
    })
    .catch((err) => console.error(err));
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const isEmpty = (string) => {
  if (string.trim() === '') return true;
  return false;
}

const isEmail = (string) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(string.match(emailRegEx)) return true;
  return false;
}

app.post('/matchrequest', (req, res) => {
  const newMatchRequest = {
    created: new Date().toISOString(),
    duration: req.body.duration,
    from: req.body.from,
    to: req.body.to,
    console: req.body.console,
    game: req.body.game,
    status: req.body.status    
  };
  db
    .collection('matchrequests')
    .add(newMatchRequest)
    .then(doc => {
      res.json({message: `document ${doc.id} created successfully`});
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: 'Something went wrong on server side.'});
    });
  });

//Signup Route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  let errors = {};
  if(isEmpty(newUser.email)){
    errors.email = 'Must not be empty';
  } 
  else if(!isEmail(newUser.email)){
    errors.email = 'Must be a valid email';
  }
  if(isEmpty(newUser.password)) errors.password = 'Must not be empty';
  if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';
  if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty';
  
  if(Object.keys(errors).length > 0 ) return res.status(400).json(errors);

  
  //TODO: Validate Data
  let token, userId;
  db.doc(`/users/${newUser.handle}`).get()
  .then(doc => {
    if(doc.exists){
      return res.status(400).json({handle: 'this handle is already taken'});
    } else {
      return firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password);    
    }
  })
  .then(data => {
    userId = data.user.uid; 
    return data.user.getIdToken();
  })
  .then((idToken => {
    token = idToken;
    const userCredentials = {
      handle: newUser.handle,
      email: newUser.email,
      created: new Date().toISOString(),
      userId
    };
    return db.doc(`/users/${newUser.handle}`).set(userCredentials);
  }))
  .then(() => {
    return res.status(201).json({token});
  })
  .catch(err => {
     console.error(err);
     if (err.code === 'auth/email-already-in-use'){
       return res.status(400).json({email: 'Email is already in use.'})
     }
     return res.status(500).json({error: err.code});
  })
});

app.post('/login', (req, res)=> {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  let errors = {};
  if(isEmpty(user.email)) errors.email = "must not be empty";
  if(isEmpty(user.password)) errors.password = "must not be empty";

  if(Object.keys(errors).length > 0) return res.status(400).json(eroors);

  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(200).json({token});
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/wrong-password'){
        return res.status(403).json({general: 'Wrong credentials, please try again'});
      } else if(err.code === 'auth/user-not-found'){
        return res.status(403).json({general: 'this user does not exist in the database'});
      }
      return res.status(500).json({error: error.code});
    });
});


// https://baseurl.com/api/whateverendpoint
exports.api = functions.https.onRequest(app);