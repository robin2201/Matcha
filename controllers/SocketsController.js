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
        //dbMatches.find({
        //     _id: {
        //         $in: roomsChat
        //     }
        // }, (err ,resRoom) => {
        //     if (err) return res.sendStatus(500)
        //     else{
        //         console.log(resRoom)
        //         console.log(resRoom.message)
        //         return res.render('affinity', {
        //             user: req.session.user,
        //             message: "Here you can flirt with yours matches,, Enjoy! ❤️",
        //             chatrooms: resRoom
        //         })
        //     }
        // })


            //.toArray()
            // .then(eachDocumentOfRoom => {
            //     let newTabWithDataFormatted = eachDocumentOfRoom.map(elem => {
            //         let obj = {}
            //         obj.user = obj.user1 = dbUser.findOne({"room":obj._id}, out).then(x => {
            //             console.log("mdr")
            //             console.log(x)
            //             return x})
            //         console.log("tesst")
            //         obj._id = objectId(elem._id)
            //         // obj.user1 = dbUser.findOne({_id:obj._id})
            //         // for(let test of obj.user1){
            //         //     console.log("Heeeeeeeeeeeeeee")
            //         //     console.log(test)
            //         // }
            //         obj.message = elem.message
            //         return obj
            //     })
            //     console.log("Out of my Promise")
            //     console.log(obj)
            //     return newTabWithDataFormatted
            // }).then(retPromiseRoom => {
            //     let RoomWithUsersInfo = retPromiseRoom.map(elem => {
            //         console.log('id tp add '+ elem._id)
            //         console.log(elem.user1)
            //         let obj = {}
            //         obj._id = objectId(elem._id)
            //         obj.message = elem.message
            //         return obj
            //     })
            //     return RoomWithUsersInfo
            // }).then(finalResult => {
            //     finalResult.map(elem => {
            //         console.log(elem._id)
            //         console.log(elem.message[0].nickname)
            //     })
            // })



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