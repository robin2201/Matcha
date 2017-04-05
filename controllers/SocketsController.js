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
        let dbMatches = mongoUtil.getDb().collection('Matches')
        let dbUser = mongoUtil.getDb().collection('Users')
        // dbMatches.find({
        //     _id: {
        //         $in: roomsChat
        //     }
        // }).toArray((err, ress) => {
        //     if (err) return res.sendStatus(500)
        //     else {
        //         req.session.user = usr
        //         return res.render('affinity', {
        //             user: req.session.user,
        //             message: "Here you can flirt with yours matches,, Enjoy! ❤️",
        //             chatrooms: ress
        //         })
        //     }
        // })
        let Myroom = dbMatches.find({
            _id: {
                $in: roomsChat
            }
        }).toArray()
            .then(eachDocumentOfRoom => {
                let newTabWithDataFormatted = eachDocumentOfRoom.map(elem => {
                    let obj = {}
                    obj._id = objectId(elem._id)
                    obj.message = elem.message
                    return obj
                })
                return newTabWithDataFormatted
            }).then(retPromiseRoom => {
                let RoomWithUsersInfo = retPromiseRoom.map(elem => {
                    console.log('id tp add '+ elem._id)
                    let obj = {}
                    obj._id = objectId(elem._id)
                    obj.message = elem.message
                    return obj
                })
                return RoomWithUsersInfo
            }).then(finalResult => {
                finalResult.map(elem => {
                    console.log(elem._id)
                    console.log(elem.message[0].nickname)
                })
            })


        return res.render('affinity', {
            user: req.session.user,
            message: "Here you can flirt with yours matches,, Enjoy! ❤️",
            chatrooms: Myroom
        })


        // dbMatches.find({
        //     _id: {
        //         $in: roomsChat
        //     }
        // }).map(doc => {
        //
        //     let idToFindOtherPeople = doc._id
        //     console.log(doc)
        //     let otherUser = dbUser.findOne({
        //             _id: objectId(idToFindOtherPeople)
        //         }, out,
        //         (err, resUserWithSameRoom) => {
        //             if (err) return res.sendStatus(500)
        //             else {
        //                 console.log(resUserWithSameRoom)
        //                 return resUserWithSameRoom}
        //         })
        //     return otherUser
        // })
        //     .toArray((err, ress) => {
        //     if (err) return res.sendStatus(500)
        //     else {
        //         console.log('test')
        //         console.log(ress)
        //         req.session.user = usr
        //         return res.render('affinity', {
        //             user: req.session.user,
        //             message: "Here you can flirt with yours matches,, Enjoy! ❤️",
        //             chatrooms: ress
        //         })
        //     }
        // })
        // let ress = new Promise (
        //     (resolve, reject) => {
        //     dbMatches.find({
        //      _id: {
        //          $in: roomsChat
        //      }
        // // })
        //     //.toArray(err => {
        //     // if (err) return res.sendStatus(500)
        //  }).forEach(resu => {
        //      console.log(resu)
        //      //dbUser.findOne({resu._id})
        // })//.then(ret => {
        // //     return ret
        // // })
        //         resolve(resu)
        // })

        //.then(val => {
        //   return val
        //})
        // console.log(ress)

        // return res.render('affinity', {
        //     user: req.session.user,
        //     message: "Here you can flirt with yours matches,, Enjoy! ❤️",
        //     chatrooms: ress
        // })

    },

    saveMessageFromSocketsToDb: (req, res, arrayMessage) => {
        let user = req.session.user

    }

}