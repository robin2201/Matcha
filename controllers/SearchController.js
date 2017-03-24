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
        let dbkey = {}
        let user = req.session.user
        let UsersSearch = []

        if (gender !== undefined || gender !== '') {
            if (gender === '1') {
                dbkey.gender = '1'
            } else if (gender === '0') {
                dbkey.gender = '0'
            }
        }
        if (search !== undefined && search !== '') {
            dbkey.tags = search
        }
        if (ageMin || ageMax) {
            dbkey.age = {
                $gt: (ageMin ? ageMin : '18'),
                $lt: (ageMax ? ageMax : '100')
            }
        }

        mongoUtil.connectToServer((err) => {
            if (err) return res.sendStatus(500)
            let dbUser = mongoUtil.getDb().collection('Users')
            if (dbkey.gender !== undefined || dbkey.tags !== undefined || dbkey.age !== undefined) {
                dbUser.find(dbkey, out).toArray((err, dataUsers) => {
                    UsersSearch = dataUsers
                    req.session.user = user
                    res.render('home', {users: UsersSearch})
                })
            } else {
                dbUser.find({}, out).toArray((err, dataUsers) => {
                    UsersSearch = dataUsers
                    req.session.user = user
                    res.render('home', {users: UsersSearch})
                })
            }
            console.log('re1')
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
        console.log('here')
        let user = req.session.user
        if(user.location.coordinates){
            mongoUtil.connectToServer((err) => {
                console.log('here2')

                if(err) return res.sendStatus(500)
                let dbUser = mongoUtil.getDb().collection('Users')
                dbUser.createIndex({location: "2dsphere"})
                console.log(user.location.coordinates)
                let geoFind = {
                   // location:{
                        $geoWithin:{
                            $geometry:{
                                type:"Point",
                                coordinates: [2.3174956, 48.86666899999999]
                            }
                        }
                    //}
                }

                dbUser.find(geoFind, out).toArray( (err, dataUsers) => {
                    let UsersSearch = dataUsers
                    req.session.user = user
                    res.render('home', {users: UsersSearch})
                })
            })
        }
    }
}

