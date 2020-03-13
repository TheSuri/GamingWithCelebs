const { db } = require('../util/admin');

exports.getAllMatchRequests = (req, res) => {
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
};

exports.postMatchRequest = (req, res) => {
    const newMatchRequest = {
      created: new Date().toISOString(),
      duration: req.body.duration,
      from: req.user.handle,
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
};