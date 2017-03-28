/**
 * Created by robin on 3/10/17.
 */

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

    SearchByNickname: (req, res) => {
        let {gender, search, ageMin, ageMax, distMin, distMax} = req.body
        let user = req.session.user
        let UsersSearch = []
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
            if (gender === '1') {
                geoFind.gender = '1'
            } else if (gender === '0') {
                geoFind.gender = '0'
            }
        }
        if (search !== undefined && search !== '') {
            geoFind.tags = search
        }
        if (ageMin || ageMax) {
            geoFind.age = {
                $gt: (ageMin ? ageMin : '18'),
                $lt: (ageMax ? ageMax : '100')
            }
        }
        mongoUtil.connectToServer((err) => {
            if (err) return res.sendStatus(500)
            console.log(geoFind)
            let dbUser = mongoUtil.getDb().collection('Users')
            dbUser.find(geoFind, out).toArray((err, dataUsers) => {
                UsersSearch = dataUsers
                req.session.user = user
                res.render('home', {users: UsersSearch})
            })
        })
    },

    showOneUser: (req, res) => {
        let userToFind = req.params.id
        let user = req.session.user

        if (userToFind !== undefined || userToFind !== "") {
            mongoUtil.connectToServer((err) => {
                if (err) return res.sendStatus(500)
                let dbUser = mongoUtil.getDb().collection('Users')
                dbUser.findOne({
                        _id: objectId(userToFind.substr(1))
                    },
                    out,
                    (err, result) => {
                        if (err) return res.sendStatus(500)
                        if (result) {
                            req.session.user = user
                            let userToShow = result
                            res.render('single', {userToShow: userToShow})
                        }
                    }
                )
            })
        }
    },

    likeAndVerifyOtherProfile: (req, res) => {
        let user = req.session.user
        let idUserToLike = objectId(req.body.UsertoLike)
        if (user && idUserToLike) {
            mongoUtil.connectToServer((err) => {
                if (err) return res.sendStatus(500)
                else {
                    let dbUser = mongoUtil.getDb().collection('Users')
                    dbUser.findOne({
                            _id: idUserToLike
                        },
                        (err, resultUser) => {
                            req.session.user = user
                            if (err) return res.sendStatus(500)
                            else if (resultUser) {
                                if (resultUser.matches) {
                                    for (let userLiked of resultUser.matches) {
                                        if (userLiked._id === user._id) {
                                            console.log("Before render view")
                                            res.render('home', {
                                                user: req.session.user,
                                                message: "Sorry you have already like this user"
                                            })
                                            break
                                        }
                                    }

                                } //else {
                                console.log("teteteteteteteteetetet")
                                    let usr = {}
                                    usr._id = user._id
                                    dbUser.updateOne({
                                            _id: idUserToLike,
                                        }, {
                                            $addToSet: {
                                                "matches": usr
                                            }
                                        },
                                        (err, resultUpdate) => {
                                            if (err) return res.sendStatus(500)
                                            else {
                                                //console.log(resultUpdate)
                                                res.render('home', {
                                                    user: user,
                                                    message: "Yes that is good"
                                                })
                                            }
                                        }
                                    )
                               // }

                            }
                        })
                }
            })


        }

    }
}

