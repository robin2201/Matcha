/**
 * Created by robin on 3/10/17.
 */

const mongoUtil = require('../config/db')
const objectId = require('mongodb').ObjectID
const updateMySession = require('./UserController').updateMySession
const out = {
    projection:{
        hash: 0,
        email: 0,
        token: 0,
        lastname: 0,
        birthday: 0
    },
    returnOriginal: false
}

module.exports = {

    SearchByNickname: (req, res) => {

        updateMySession(req, res)
        let {gender, search, ageMin, ageMax, distMin, distMax} = req.body
        let user = req.session.user
        if (distMin)
            distMin = parseInt(distMin) * 1000
        if (distMax)
            distMax = parseInt(distMax) * 1000

        let geoFind = {
            location: {
                $near: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: user.location.coordinates
                    },
                    $minDistance: (distMin ? distMin : 0),
                    $maxDistance: (distMax ? distMax : 500000000)
                }
            }
        }

        if (gender !== undefined || gender !== '') {
            if (user.orientation !== undefined && user.orientation !== "" && gender === undefined) {
                geoFind.gender = (user.orientation === '0' ? '0' : '1')
            }
            else if (gender === "1") {
                geoFind.gender = "1"
            } else if (gender === "0") {
                geoFind.gender = "0"
            }
        }
        if (search !== undefined && search !== '') {
            geoFind.tags = search
        }
        if (ageMin || ageMax) {
            geoFind.age = {
                $gte: (ageMin ? parseInt(ageMin) : 18),
                $lt: (ageMax ? parseInt(ageMax) : 100)
            }
        }

        mongoUtil.connectToServer(err => {
            if (err) return res.sendStatus(500)

            let dbUser = mongoUtil.getDb().collection('Users')
            dbUser.createIndex({"location": "2dsphere"})
            dbUser.find(geoFind, out)
                .toArray((err, dataUsers) => {
                    req.session.user = user
                    if (err) return res.sendStatus(500)
                    else if (dataUsers) {
                        if (user.block !== undefined && user.block !== '') {
                            let ArrayUsersWithoutBlockedPeople = []
                            console.log('In block')
                            user.block.map(MyBlockedProfile => {
                                for (let Users of dataUsers) {
                                    console.log('id ' + Users._id)
                                    console.log('Myblock ' + MyBlockedProfile)
                                    if (String(Users._id) !== String(MyBlockedProfile)) {
                                        ArrayUsersWithoutBlockedPeople.push(Users)
                                    }
                                }
                            })
                            ArrayUsersWithoutBlockedPeople.shift()
                            return res.render('home', {
                                users: ArrayUsersWithoutBlockedPeople,
                                user: user
                            })
                        }
                        if (String(dataUsers[0]._id) === String(user._id)) {
                            console.log('Hello')
                            dataUsers.shift()
                        }
                        return res.render('home', {
                            users: dataUsers,
                            user: user
                        })
                    }
                    else return res.render('home', {
                            user: req.session.user,
                            message: "No match found"
                        })
                })
        })
    },

    saveVisitToProfilForNotif: (idUser, nickname, idUserVisited) => {
        let dbUser = mongoUtil.getDb().collection('Users')
        dbUser.findOneAndUpdate({
                _id: objectId(idUserVisited.substr(1))
            },
            {
                $addToSet: {
                    'notifications': {
                        'type': "visit",
                        'nickname': nickname
                    }
                }
            },
            err => {
                return err
            })
    },

    showOneUser: (req, res) => {
        updateMySession(req, res)
        let userToFind = req.params.id
        let user = req.session.user
        if (userToFind !== undefined && userToFind !== "" && user) {
            let saveVisit = module.exports.saveVisitToProfilForNotif(user._id, user.nickname, userToFind)
            if (saveVisit) console.log('Notif saved to db')
            mongoUtil.connectToServer(err => {
                if (err) return res.sendStatus(500)
                let dbUser = mongoUtil.getDb().collection('Users')
                dbUser.findOne({
                        _id: objectId(userToFind.substr(1))
                    },
                    out,
                    (err, resultSingleUser) => {
                        let NoMatchedRooms = true
                        if (err) return res.sendStatus(500)
                        else {
                            if (resultSingleUser.room !== undefined && resultSingleUser.room !== '' && user.room !== undefined && user.room !== '') {
                                let i = 0
                                while (i <= resultSingleUser.room.length) {
                                    console.log(resultSingleUser[0])
                                    let o = 0
                                    while (o <= user.room.length) {
                                        console.log(user.room[o])
                                        if (String(user.room[o]) === String(resultSingleUser.room[i]) && (user.room[o] !== undefined && resultSingleUser.room[i] !== undefined)) {
                                            NoMatchedRooms = false
                                            break
                                        }
                                        o++
                                    }
                                    if (NoMatchedRooms === false) {
                                        console.log('Yes')
                                        let dbMatches = mongoUtil.getDb().collection('Matches')
                                        dbMatches.findOne({
                                                _id: objectId(user.room[o])
                                            },
                                            (err, resMyRoomChat) => {
                                                if (err) return res.sendStatus(500)
                                                else if (resMyRoomChat !== null) {
                                                    req.session.user = user
                                                    if (resMyRoomChat.message === undefined)
                                                        resMyRoomChat.message = ''
                                                    return res.render('single', {
                                                        userToShow: resultSingleUser,
                                                        user: req.session.user,
                                                        chatRooms: (resMyRoomChat.message ? resMyRoomChat.message : ''),
                                                        idRoom: resMyRoomChat._id,
                                                        need: true
                                                    })
                                                }

                                            })
                                        break
                                    } else if (i === resultSingleUser.room.length && NoMatchedRooms === true) {
                                        req.session.user = user
                                        return res.render('single', {
                                            userToShow: resultSingleUser,
                                            user: req.session.user
                                        })
                                    }
                                    o = 0
                                    i++
                                }
                            }
                            else {
                                req.session.user = user
                                return res.render('single', {
                                    userToShow: resultSingleUser,
                                    user: req.session.user
                                })
                            }
                        }
                    }
                )
            })
        }
    },

    blockOther: (req, res) => {
        updateMySession(req, res)
        let user = req.session.user
        let idUserToBlock = req.body.UsertoBlock
        if (user.block !== undefined && user.block !== '') {

        }
        if (user && idUserToBlock) {
            mongoUtil.connectToServer(err => {
                if (err) return res.sendStatus(500)
                else {
                    let dbUser = mongoUtil.getDb().collection('Users')
                    dbUser.findOneAndUpdate({
                            _id: objectId(user._id)
                        },
                        {
                            $addToSet: {
                                'block': idUserToBlock
                            },
                            $pull: {
                                'matches': idUserToBlock
                            }
                        },
                        err => {
                            if (err) return res.sendStatus(500)
                            else return res.render('home', {
                                user: user,
                                message: "This User is Blocked"
                            })
                        })
                }
            })
        }
    },

    checkMyMatch: (mySession, idToCheck) => {
        if (mySession.matches !== undefined) {
            for (let rest of mySession.matches) {
                if (String(rest._id) === String(idToCheck)) return true
            }
            return false
        } else return false
    },

    likeAndVerifyOtherProfile: (req, res) => {
        updateMySession(req, res)
        let idUserToLike = objectId(req.body.UsertoLike)
        let ifMatchMe = module.exports.checkMyMatch(req.session.user, idUserToLike)
        let user = req.session.user
        if (user && idUserToLike) {
            mongoUtil.connectToServer(err => {
                if (err) return res.sendStatus(500)
                else {
                    let dbUser = mongoUtil.getDb().collection('Users')
                    dbUser.findOne({
                            $and: [
                                {_id: idUserToLike},
                                {matches: {_id: user._id}}
                            ]
                        },
                        (err, resultUser) => {
                            req.session.user = user
                            if (err) return res.sendStatus(500)
                            else if (resultUser && ifMatchMe) {
                                let db = mongoUtil.getDb()
                                let Matches = db.collection('Matches')
                                Matches.insertOne({"message": []},
                                    (err, resMatchCollection) => {
                                        if (err) return res.sendStatus(500)
                                        else if (resMatchCollection && resMatchCollection.insertedCount === 1) {
                                            dbUser.updateMany({
                                                    $or: [
                                                        {_id: objectId(user._id)},
                                                        {_id: idUserToLike}
                                                    ]
                                                },
                                                {
                                                    $addToSet: {
                                                        "room": resMatchCollection.insertedId,
                                                        "notifications": {
                                                            "type": "like"
                                                        }
                                                    }

                                                },
                                                err => {
                                                    if (err) return res.sendStatus(500)
                                                })
                                        }
                                    })
                                return res.render('home', {
                                    user: req.session.user,
                                    message: "Nice, now you can chat with your match 😄"
                                })
                            } else if (resultUser) {
                                return res.render('home', {
                                    user: req.session.user,
                                    message: "You have already like this user"
                                })
                            } else {
                                let usr = {}
                                let notif = {}
                                notif.like = "You have on like"
                                notif.nickname = user.nickname
                                usr._id = user._id
                                dbUser.updateOne({
                                        _id: idUserToLike,
                                    },
                                    {
                                        $addToSet: {
                                            "matches": usr,
                                            "notifications": notif
                                        }
                                    },
                                    err => {
                                        if (err) return res.sendStatus(500)
                                        else {
                                            return res.render('home', {
                                                user: req.session.user,
                                                message: "Yes that's good"
                                            })
                                        }
                                    }
                                )
                            }
                        })
                }
            })
        }
    },

    searchAndSortByPopularity: (req, res) => {
        updateMySession(req, res)
        let user = req.session.user
        if (user !== undefined) {
            let searchElem = {}
            if (user.orientation !== undefined) searchElem.gender = user.orientation
            mongoUtil.connectToServer(err => {
                if (err) return res.sendStatus(500)
                else {
                    let dbUser = mongoUtil.getDb().collection('Users')
                    dbUser.find(searchElem, out).sort({popularity: -1}).toArray((err, dataUser) => {
                        console.log(dataUser)
                        if (err) return res.sendStatus(500)
                        else {
                            return res.render('home', {
                                user: req.session.user,
                                users: dataUser
                            })
                        }
                    })
                }
            })
        }
    }

}
