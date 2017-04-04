const mongoUtil = require('../config/db')
const objectId = require('mongodb').ObjectID

module.exports = {
    loadAllMyChat: (req, res) => {
        let usr = req.session.user
        let rooms = usr.room
        console.log(rooms)
        let dbMatches = mongoUtil.getDb().collection('Matches')
        dbMatches.find({
            _id: {
                $in: [objectId('58e3c5079e9db11e10f7ea78'), objectId('58e3c96bab02d41fb6bb1edc')]
            }
        }).toArray((err, ress) => {
            if (err) return res.sendStatus(500)
            else {
                console.log(ress)
                req.session.user = usr
                return res.render('affinity', {
                    user: req.session.user,
                    message: "Go talk",
                    chatrooms: ress
                })
            }
        })
    }
}