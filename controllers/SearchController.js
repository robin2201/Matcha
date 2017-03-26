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
        let {gender, search, ageMin, ageMax} = req.body
        let user = req.session.user
        let UsersSearch = []

        let geoFind = {
            location: {
                $near: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: user.location.coordinates
                    },
                    $minDistance: 1,
                    $maxDistance: 50000000
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

    findUserNearMyLocation: (req, res) => {
        let user = req.session.user
        if (user.location.coordinates) {
            mongoUtil.connectToServer((err) => {
                if (err) return res.sendStatus(500)
                let dbUser = mongoUtil.getDb().collection('Users')
                let geoFind = {
                    location: {
                        $near: {
                            $geometry: {
                                type: "Polygon",
                                coordinates: user.location.coordinates
                            },
                            $minDistance: 1,
                            $maxDistance: 50000000
                        }
                    }
                }
                dbUser.find(geoFind, out).toArray((err, dataUsers) => {
                    let UsersSearch = dataUsers
                    req.session.user = user
                    res.render('home', {users: UsersSearch})
                })
            })
        }
    }
}

