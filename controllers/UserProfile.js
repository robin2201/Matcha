/**
 * Created by robin on 3/2/17.
 */
const mongoUtil = require('../config/db')
const db_close = require('../config/db').closeDb
const objectId = require('mongodb').ObjectID
const NodeGeocoder = require('node-geocoder')('google')
const ipLoc = require('satelize')
const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const transporter = require('../config/mail')

module.exports = {
    //
    // loadMyProfilWithMyNotifications: (req, res) => {
    //     let user = req.session.user
    //     if(user.notifications !== undefined){
    //         console.log(user.notifications)
    //     }
    //     return res.render('profile', {
    //         user:user,
    //         notifications: user.notifications
    //     })
    // },

    ModifyInfoUser: (req, res) => {
        let value = req.body
        let id = req.session.userId
        if (value !== '') {
            mongoUtil.connectToServer(err => {
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
                            console.log(result)
                            req.session.user = result.value
                            req.session.userId = result.value._id
                            res.render('profile', {
                                user: req.session.user,
                                message: result.value + " are modified with sucess!"
                            })

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
        if (regex.test(email)) {
            mongoUtil.connectToServer(err => {
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

    sendEmailInstructionForNewPassword: (req, res) => {
        let email = req.body.email
        if (email !== undefined && regex.test(email)) {
            mongoUtil.connectToServer(err => {
                if (err) return res.sendStatus(500)
                else {
                    let dbUser = mongoUtil.getDb().collection('Users')
                    dbUser.findOne({
                            'email': email
                        },
                        (err, retMyProfile) => {
                            console.log("Sucess " + retMyProfile)
                            if (err) return res.sendStatus(500)
                            else if (sucess === undefined || sucess === '') return res.render('index', {
                                message: "Sorry this mail doesn't exist"
                            })
                            else {
                                transporter.verify(error => {
                                    if (error) return console.log(error)
                                    else {
                                        let EmailContent = 'http://localhost:3000/profile/modifPass/:' + retMyProfile._id
                                        let message = {
                                            from: 'MatchaHelper@love.com',
                                            to: email,
                                            subject: 'Modification of your password',
                                            text: 'Hello You',
                                            html: '<b>Hello,, to change your email please click on the link</b>' +
                                            '<p>Cliquer sur le lien suivant : </p>' +
                                            '<a href="' + EmailContent + '">Modify my password</a> ',
                                        }
                                        transporter.sendMail(message,
                                            (error, info) => {
                                                if (error) return console.log(error)
                                                else console.log('Message %s sent: %s', info.messageId, info.response)
                                                transporter.close()
                                            })
                                    }
                                })
                                return res.render('index', {
                                    message: "Info are send on your email"
                                })
                            }
                        })
                }
            })
        } else return res.render('index', {
            message: "Invalid mail please retry"
        })
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
                            return res.render('profile', {user: user})
                        }
                    })

            })
        } else {
            req.session.user = user
            return res.render('profile', {
                user: user,
                message: "Sorry this is not the age for our service"
            })
        }
    },

    AddTags: (req, res) => {

        let id = req.session.userId
        let user = req.session.user
        let tag = req.body.tags
        if (tag !== undefined || tag !== "") {
            mongoUtil.connectToServer(err => {
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
                        if (result) {
                            console.log(result)
                            req.session.user = result.value ? result.value : user
                            req.session.userId = id
                            return res.render('profile', {user: req.session.user})
                        }
                    })

            })
        } else {
            req.session.user = user
            return res.render('profile', {user: user})
        }
    },

    DellTags: (req, res) => {

        let id = req.session.userId
        let user = req.session.user
        let tag = req.body.info
        if (tag !== undefined && tag !== "") {
            mongoUtil.connectToServer(err => {
                if (err) return res.sendStatus(500)
                let dbUser = mongoUtil.getDb().collection('Users')
                dbUser.findOneAndUpdate({
                        _id: objectId(id)
                    },
                    {
                        $pull: {
                            "tags": tag
                        }
                    },
                    (err, result) => {
                        if (err) return res.sendStatus(500)
                        if (result) {
                            req.session.user = result.value ? result.value : user
                            console.log('lol')
                            req.session.userId = id
                            return res.render('profile', {
                                user: req.session.user,
                                message: "Tag " + tag + " supprimer de vos affinitées"
                            })
                        }
                    })

            })
        } else {
            req.session.user = user
            return res.render('profile', {
                user: user,
                message: "Sorry an error occured"
            })
        }
    },

    FindAdressWithIP: (req, res) => {
        let id = req.session.userId
        let ipToFind = req.ip
        if (ipToFind === "::1") {
            ipToFind = "62.210.32.10"
        }
        ipLoc.satelize({ip: ipToFind}, (err, payload) => {
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
                                            return res.render('profile', {user: req.session.user})
                                        }
                                    })
                            })
                        }
                    })
            }
        })

    },

    AddLocation: (req, res) => {
        let city = (req.body.city ? req.body.city : 'Paris')
        let user = req.session.user
        let id = req.session.userId
        if (city !== undefined || city !== "") {
            NodeGeocoder.geocode(city, (err, resu) => {
                if (err) res.sendStatus(500)
                console.log(resu)
                if (resu.length === 0) {
                    console.log("Noooooo")
                    return module.exports.FindAdressWithIP(req, res)

                }
                else if (resu[0].location !== '' && resu[0].latitude !== '' && resu.length !== 0) {
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
                                    return res.render('profile', {user: req.session.user})
                                }
                            }
                        )

                    })
                }
            })
        } else {
            req.session.user = user
            req.session.userId = id
            return res.render('profile', {user: req.session.user})
        }
    },

    clearAllMyNotifications: (req, res) => {
        let user = req.session.user
        if (user && (user._id !== '' || user._id !== undefined)) {
            let dbUser = mongoUtil.getDb().collection('Users')
            dbUser.findOneAndUpdate({
                    _id: objectId(user._id)
                },
                {
                    $unset: {'notifications': ''}
                },
                err => {
                    if (err) return res.sendStatus(500)
                    else {
                        req.session.user = user
                        return res.render('profile', {
                            user: req.session.user,
                            message: 'All your notifications are cleared'
                        })
                    }
                })
        }
    }
}