const {admin, db} = require('../util/admin');
const firebaseConfig = require('../util/config');
const config = require('../util/config');
const {validateSignupData, validateLoginData, validateCelebrityData} = require('../util/validators');
 

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);


exports.signup = (req, res, next) => {
  const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle,
      isCeleb: req.path === '/signupcelebrity'
    };

    const { valid, errors } = validateSignupData(newUser);
    if(!valid) return res.status(400).json(errors);
    
    const noImg = 'no-img-profile.png'

    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
    if(doc.exists){
        res = res.status(400).json({handle: 'this handle is already taken'});
        return res;
    } 
    else {
      firebase.auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password)
      .then(data => {
        userId = data.user.uid; 
        return data.user.getIdToken();    
      })
      .then((idToken) => {
        token = idToken;
        const userCredentials = {
          handle: newUser.handle,
          email: newUser.email,
          created: new Date().toISOString(),
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
          isCeleb: newUser.isCeleb,
          userId
        };
        return db.doc(`/users/${newUser.handle}`).set(userCredentials);
      })
      .then(() => {
          req.body.token = token;
          return next();
      })
      .catch(err => {
        console.error(err);
        if (err.code === 'auth/email-already-in-use'){
          return res.status(400).json({email: 'Email is already in use.'})
        }
        return res.status(500).json({error: err.code});
      })
    }
    });
};


exports.signupuser = (req, res) => {
  return res.status(201).json({token: req.body.token});
};

exports.signupcelebrity = (req, res) => {
  let celebdeets = {
    categories: req.body.categories,
    //Gamelistings will be empty on this route
    //Will create a new route to add game listings
    gamelistings: [],
    matchrequests: [],
    status: "online"
  };
  
  const { valid, errors } = validateCelebrityData(celebdeets);
  
  if(!valid) return res.status(400).json(errors);
  db.doc(`/celebs/${req.body.handle}`).set(celebdeets)
  .then(() => {
    return res.status(201).json({token: req.body.token});
  })
  .catch(err => {
     console.error(err);
     return res.status(500).json({error: err.code});
  });
};

exports.login = (req, res)=> {
    const user = {
      email: req.body.email,
      password: req.body.password
    };

    const { valid, errors } = validateLoginData(user);

    if(!valid) return res.status(400).json(errors);
 
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
}

//Add user details

// exports.addUserDetails = (req, res) => {
//   let userDetails = reduceUserDetails(req.body);


// }

//Upload Image for user
exports.uploadImage = (req, res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');
   
  const busboy = new BusBoy({headers: req.headers});
  
  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype)=> {
    if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
      return res.status(400).json({iamge: 'Please only submit jpeg or png type of files.'})
    }
    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    imageFileName = `${Math.round(Math.random() * 10000000000000)}.${imageExtension}`;
    const filePath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = {filePath, mimetype};
    file.pipe(fs.createWriteStream(filePath));
  });
  busboy.on('finish', () => {
    admin.storage().bucket().upload(imageToBeUploaded.filePath, {
      resumable: false,
      metadata: {
        metadata:{
          contentType: imageToBeUploaded.mimetype
        }
      }
    })
    .then(() => {
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
      return db.doc(`/users/${req.user.handle}`).update({imageUrl: imageUrl});
    })
    .then(() => {
      return res.json({message: 'Image Uploaded Successfully'});
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    })
  });
  busboy.end(req.rawBody);
}