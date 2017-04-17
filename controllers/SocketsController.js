const mongoUtil = require('../config/db')
const objectId = require('mongodb').ObjectID

const out = {
    hash: 0,
    email: 0,
    token: 0,
    lastname: 0,
    birthday: 0
}


module.exports = {

    loadAllMyChat: (req, res) => {
        let usr = req.session.user
        const roomsChat = usr.room.map(x => {
            return objectId(x)
        })
        let dbUser = mongoUtil.getDb().collection('Users')
        dbMatches.find({
            _id: {
                $in: roomsChat
            }
        }).toArray((err, resMyRoomChat) => {
            if (err) return res.sendStatus(500)
            else {

                req.session.user = usr
                return res.render('affinity', {
                    user: req.session.user,
                    message: "Here you can flirt with yours matches,, Enjoy! ❤️",
                    chatrooms: resMyRoomChat
                })
            }
        })
    },

    saveMessageFromSocketsToDb: (idRoom, message, nickname) => {
        let dbMatches = mongoUtil.getDb().collection('Matches')
        let mongoMessageFormatted = {}
        mongoMessageFormatted.nickname = nickname
        mongoMessageFormatted.message = message
        dbMatches.updateOne({
            _id: objectId(idRoom)
        },
            {
                $addToSet:{
                    "message": mongoMessageFormatted
                }
            },
            err => {
            if(err) return console.log('Error during Socket transmission')
            })
    }
}