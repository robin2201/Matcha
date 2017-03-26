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
            req.session.userId = id
            req.session.user = user
            res.render('profile', {
                user: req.session.user,
                message: "Error wrong email"
            })
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
        } else {
            req.session.user = user
            res.render('profile', {user: user})
        }
    },

    AddLocation: (req, res) => {
        let city = (req.body.city ? req.body.city : 'Paris')
        let user = req.session.user
        let id = req.session.userId
        if (city !== undefined || city !== "") {
            NodeGeocoder.geocode(city, (err, resu) => {
                if (err) res.sendStatus(500)
                console.log(resu)
                //if (typeof resu[0] !== ''){
                if (resu.length > 0){
                //if (resu[0].longitude !== undefined && resu[0].latitude !== undefined) {
                    let location = {}
                    location.type = 'Point'
                    location.coordinates = [resu[0].longitude, resu[0].latitude]
                    mongoUtil.connectToServer((err) => {
                        if (err) return res.sendStatus(500)
                        let dbUser = mongoUtil.getDb().collection('Users')
                        dbUser.findOneAndUpdate({
                                _id: objectId(id)
                            },
                            {
                                $set: {
                                    "location": location,
                                    "country": resu[0].country,
                                    "city": resu[0].city,
                                    "region": resu[0].administrativeLevels.level1short
                                }
                            },
                            (err, result) => {
                                if (err) return res.sendStatus(500)
                                if (result && result.ok === 1) {
                                    req.session.user = result.value
                                    req.session.userId = result.value.id
                                    res.render('profile', {user: req.session.user})
                                }
                            }
                        )

                    })
                } else {
                    this.FindAdressWithIP(req, res)
                }

            })
        } else {
            req.session.user = user
            req.session.userId = id
            res.render('profile', {user: req.session.user})
        }
    },

    FindAdressWithIP: (req, res) => {
        let id = req.session.userId
        ipLoc.satelize({ip: req.ip}, (err, payload) => {
            if (err) return res.sendStatus(500)
            else if (payload) {
                NodeGeocoder.reverse({
                        lat: payload.latitude,
                        lon: payload.longitude
                    },
                    (err, resu) => {
                        if (err) return res.sendStatus(500)
                        else {
                            let location = {}
                            location.coordinates = [resu[0].longitude, resu[0].latitude]
                            location.type = 'Point'
                            mongoUtil.connectToServer((err) => {
                                if (err) return res.sendStatus(500)
                                let dbUser = mongoUtil.getDb().collection('Users')
                                dbUser.findOneAndUpdate({
                                        _id: objectId(id)
                                    },
                                    {
                                        $set: {
                                            "location": location,
                                            "country": resu[0].country,
                                            "city": resu[0].city,
                                            "region": resu[0].administrativeLevels.level1short
                                        }
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
                        }
                    })
            }
        })

    }

}