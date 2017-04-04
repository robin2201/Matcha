const mongoUtil = require('../config/db')
const objectId = require('mongodb').ObjectID

module.exports = {
    loadAllMyChat: (req, res) => {
        let usr = req.session.user
        let dbMatches = mongoUtil.getDb().collection('Matches')
        dbMatches.find({
                $or: [
                    {_id1: objectId(usr._id)},
                    {_id2: objectId(usr._id)}
                ]
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
            // ,
            // (err, ress) => {
            //     if (err) return res.sendStatus(500)
            //     else {
            //         console.log(ress)
            //         return res.render('affinity', {
            //             user: req.session.user,
            //             message: "Go talk",
            //             mattt: ress
            //         })
            //     }
            //})

    }
}