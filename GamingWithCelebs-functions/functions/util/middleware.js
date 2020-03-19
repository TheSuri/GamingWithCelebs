const {admin, db} = require('./admin');

exports.FBauth = (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
      idToken = req.headers.authorization.split('Bearer ')[1];
    } else{
      console.error('No token found')
      return res.status(403).json({error: 'Unauthorized'});
    }
  
    admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      console.log(decodedToken);
      console.log(req.user.uid);
      return db.collection('users')
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      doc_data = data.docs[0].data()
      req.user.handle = doc_data.handle;
      req.user.isCeleb = doc_data.isCeleb;
      return next();
    })
    .catch(err => {
      console.error('Error verifying token.');
      return res.status(403).json(err);
    })
}

exports.checkCelebrity = (req, res, next) => {
  if (req.isCeleb == false) return res.status(403).json({error: 'User is not a celebrity'});
  return next();
}

  