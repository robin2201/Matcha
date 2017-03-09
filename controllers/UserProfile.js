/**
 * Created by robin on 3/2/17.
 */
const mongoUtil = require('../config/db');
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
                dbUser.findOneAndUpdate(
                    {
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

                            res.redirect('/profile')
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
                        }
                    })
            })
        } else {
            console.log("Error wrong email")
            req.session.userId = id
            req.session.user = user
            res.render('profile')
        }
        res.render('profile')
    },

    AddLocation: (req, res) => {
        let city = req.body.city
        let user = req.session.user
        let id = req.session.userId
        console.log(req.session)
        if (city !== undefined || city !== "") {
            NodeGeocoder.geocode(city, (err, resu) => {
                let location = {}
                location.long = resu[0].longitude
                location.lat = resu[0].latitude
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
                            }
                        }
                    )
                })
            })
        }
        else {
            req.session.user = user
            req.session.userId = id
        }
        res.render('profile')
    },

    AddAge: (req, res) => {

    },

    AddTags: (req, res) => {
        let id = req.session.userId
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

                        }
                    })

            })
        }
        res.render('profile')
    },

    FindAdressWithIP: (req, res) => {
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
                            location.long = resu[0].longitude
                            location.lat = resu[0].latitude
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