/**
 * Created by robin on 3/2/17.
 */
const mongoUtil = require('../config/db')
const objectId = require('mongodb').ObjectID
const NodeGeocoder = require('node-geocoder')('google')
const ipLoc = require('satelize')

module.exports = {
    ModifyInfoUser: (req, res) => {
        let value = req.body
        let id = req.session.userId
        if (value !== '') {
            mongoUtil.connectToServer((err) => {
                if (err) return res.sendStatus(500)
                let dbUser = mongoUtil.getDb().collection('Users')
                dbUser.findOneAndUpdate({
                        _id: objectId(id)
                    },
                    {
                        $set: value
                    },
                    (err, result) => {
                        if (err) return res.sendStatus(500)
                        if (result && result.ok === 1) {
                            req.session.user = result.value
                            req.session.userId = result.value._id
                            console.log(req.session)
                            res.render('profile', {user: req.session.user})

                        }
                    }
                )
            })
        }
    },

    ModifyEmail: (req, res) => {
        let email = req.body.email
        let id = req.session.userId
        let user = req.session.user
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (regex.test(email)) {
            mongoUtil.connectToServer((err) => {
                if (err) res.sendStatus(500)
                let dbUser = mongoUtil.getDb().collection('Users')
                dbUser.findOneAndUpdate({
                        _id: objectId(id)
                    },
                    {
                        $set: {"email": email}
                    },
                    (err, result) => {
                        if (err) return res.sendStatus(500)
                        else {
                            req.session.user = result.value
                            req.session.userId = result.value.id
                            res.render('profile', {user: req.session.user})
                        }
                    })
            })
        } else {
            console.log("Error wrong email")
            req.session.userId = id
            req.session.user = user
            res.render('profile', {user: req.session.user})
        }
    },

    AddLocation: (req, res) => {
        let city = req.body.city
        let user = req.session.user
        let id = req.session.userId
        console.log(req.session)
        if (city !== undefined || city !== "") {
            NodeGeocoder.geocode(city, (err, resu) => {
                if (err) res.sendStatus(500)
                let location = {}
                location.coord = [resu[0].longitude, resu[0].latitude]
                location.country = resu[0].country
                location.city = resu[0].city
                location.region = resu[0].administrativeLevels.level1short
                mongoUtil.connectToServer((err) => {
                    if (err) return res.sendStatus(500)
                    let dbUser = mongoUtil.getDb().collection('Users')
                    dbUser.findOneAndUpdate({
                            _id: objectId(id)
                        },
                        {
                            $set: {"location": location}
                        },
                        (err, result) => {
                            if (err) return res.sendStatus(500)
                            if (result) {
                                req.session.user = result.value
                                req.session.userId = result.value.id
                                res.render('profile', {user: req.session.user})
                            }
                        }
                    )
                })
            })
        }
        else {
            req.session.user = user
            req.session.userId = id
            res.render('profile', {user: req.session.user})
        }
    },


    verifyAndSetAge: (req, res) => {
        let birthday = req.body.birthday
        let user = req.session.user
        let tmp = birthday.split('-')
        let today = new Date()
        let birthDate = new Date(tmp)
        let age = today.getFullYear() - birthDate.getFullYear()
        let month = today.getMonth() - birthDate.getMonth()

        if ((month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age) {
            let ret = {}
            ret.birthday = birthDate
            ret.age = age
            mongoUtil.connectToServer((err) => {
                if (err) return res.sendStatus(500)
                let dbUser = mongoUtil.getDb().collection('Users')
                dbUser.findOneAndUpdate({
                        _id: objectId(req.session.userId)
                    },
                    {
                        $set: ret
                    },
                    (err, resul) => {
                        if (err) return res.sendStatus(500)
                        if (resul) {
                            req.session.user = user
                            res.render('profile', {user: user})
                        }
                    })

            })
        } else {
                req.session.user = user
                res.render('profile', {
                    user: user,
                    message: "Sorry this is not the age for our service"
                })
            }
        }
        ,

        AddTags: (req, res) => {
            let id = req.session.userId
            let user = req.session.user
            let tag = req.body.tags
            if (tag !== undefined || tag !== "") {
                mongoUtil.connectToServer((err) => {
                    if (err) return res.sendStatus(500)
                    let dbUser = mongoUtil.getDb().collection('Users')
                    dbUser.findOneAndUpdate({
                            _id: objectId(id)
                        },
                        {
                            $addToSet: {
                                "tags": tag
                            }
                        },
                        (err, result) => {
                            if (err) return res.sendStatus(500)
                            if (result && result.insertedId > 1) {
                                req.session.user = result.value
                                req.session.userId = result.value.id
                                res.render('profile', {user: req.session.user})
                            }
                        })

                })
            }
            req.session.user = user
            res.render('profile', {user: req.session.user})
        },

            FindAdressWithIP
        :
        (req, res) => {
            let id = req.session.userId
            ipLoc.satelize({ip: req.ip}, (err, payload) => {
                if (err) return res.sendStatus(500)
                else {
                    NodeGeocoder.reverse({
                            lat: payload.latitude,
                            lon: payload.longitude
                        },
                        (err, resu) => {
                            if (err) return res.sendStatus(500)
                            else {
                                let location = {}
                                location.coord = [resu[0].longitude, resu[0].latitude]
                                location.country = resu[0].country
                                location.city = resu[0].city
                                location.region = resu[0].administrativeLevels.level1short
                                mongoUtil.connectToServer((err) => {
                                    if (err) return res.sendStatus(500)
                                    let dbUser = mongoUtil.getDb().collection('Users')
                                    dbUser.findOneAndUpdate({
                                            _id: objectId(id)
                                        },
                                        {
                                            $set: {"location": location}
                                        },
                                        (err, result) => {
                                            if (err) return res.sendStatus(500)
                                            else {
                                                req.session.user = result.value
                                                req.session.userId = result.value.id
                                                res.render('profile')
                                            }
                                        })
                                })
                            }
                        })
                }
            })

        }

    }