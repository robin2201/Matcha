/**
 * Created by robin on 3/2/17.
 */
const mongoUtil = require('../config/db')
const objectId = require('mongodb').ObjectID
const NodeGeocoder = require('node-geocoder')('google')
const ipLoc = require('satelize')
const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const transporter = require('../config/mail')

const out = {
    projection: {
        hash: 0,
        email: 0,
        token: 0,
        lastname: 0,
        birthday: 0
    },
    returnOriginal: false
}


module.exports = {


    regexEmail: email => {
        let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ //
        return reg.test(email)
    },

    ModifyInfoUser: (req, res) => {
        const user = req.session.user
        let bool = false
        let modif = {}
        if (req.body.nickname !== undefined && req.body.nickname !== '' && (req.body.nickname.length > 2 && req.body.nickname.length < 20)) {
            modif.nickname = req.body.nickname
            bool = true
        }
        if (req.body.firstname !== undefined && req.body.firstname !== '' && (req.body.firstname.length > 2 && req.body.firstname.length < 12)) {
            modif.firstname = req.body.firstname
            bool = true
        }
        if (req.body.lastname !== undefined && req.body.lastname !== ''&& (req.body.lastname.length > 2 && req.body.lastname.length < 12)) {
            modif.lastname = req.body.lastname
            bool = true
        }
        if (req.body.email !== undefined && req.body.email !== '' && module.exports.regexEmail(req.body.email)) {
            modif.email = req.body.email
            bool = true
        }
        if (req.body.bio !== undefined && req.body.bio !== '' && (req.body.bio.length > 0 && req.body.bio.length < 250)) {
            modif.bio = req.body.bio
            bool = true
        }
        if (req.body.city !== undefined && req.body.city !== '' && (req.body.city.length > 0 && req.body.city.length < 20)) {
            modif.city = req.body.city
            bool = true
        }
        if (req.body.orientation !== undefined && req.body.orientation !== '' && (req.body.orientation === '1' || req.body.orientation === '0' || req.body.orientation === '2')) {
            modif.orientation = req.body.orientation
            bool = true
        }
        let id = (req.session.user._id ? req.session.user._id : req.session.userId)
        if (modif !== '' && modif !== undefined && bool === true) {
            mongoUtil.connectToServer(err => {
                if (err) return res.render('error', {message:" Error,, please retry"})
                let dbUser = mongoUtil.getDb().collection('Users')
                dbUser.findOneAndUpdate({
                        _id: objectId(id)
                    },
                    {
                        $set: modif
                    },
                    out,
                    (err, result) => {
                        if (err) return res.render('error', {message:" Error,, please retry"})
                        else if (result && result.ok === 1) {
                            req.session.user = result.value
                            req.session.userId = result.value._id
                            res.render('profile', {
                                user: req.session.user,
                                message: "Your Info are modified with sucess!"
                            })
                        }
                        else {
                            req.session.user = user
                            return res.render('profile', {
                                user: req.session.user,
                                message: "Invalid Input type"
                            })
                        }
                    }
                )
            })
        } else {
            req.session.user = user
            return res.render('profile', {
                user: req.session.user,
                message: "Invalid Input type"
            })
        }
    },

    ModifyEmail: (req, res) => {
        let email = req.body.email
        let id = req.session.user._id
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
                    out,
                    (err, result) => {
                        if (err) return res.render('error', {message:" Error,, please retry"})
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
                if (err) return res.render('error', {message:" Error,, please retry"})
                else {
                    let dbUser = mongoUtil.getDb().collection('Users')
                    dbUser.findOne({
                            'email': email
                        },
                        (err, retMyProfile) => {
                             if (err) return res.render('error', {message:" Error,, please retry"})
                            else {
                                transporter.verify(error => {
                                    if (error) return console.log(error)
                                    else {
                                        let EmailContent = 'http://localhost:3000/modifPass/:' + retMyProfile._id
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
            message: "Invalid mail Or mail Not found,, please retry"
        })
    },

    verifyAndSetAge: (req, res) => {
        try {
            let birthday = req.body.birthday
            let user = req.session.user
            if (birthday !== '') {
                let tmp = birthday.split('-')
                let today = new Date()

                try {
                    let birthDate = new Date(tmp)
                    let age = today.getFullYear() - birthDate.getFullYear()
                    let month = today.getMonth() - birthDate.getMonth()
                    if (birthDate === undefined || birthDate === '' || String(birthDate) === "Invalid Date") {
                        req.session.user = user
                        return res.render('profile', {
                            user: user,
                            message: "Invalid Input"
                        })
                    }
                    else if ((month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age) {
                        if (age > 17 && age < 100) {
                            let ret = {}
                            ret.birthday = birthDate
                            ret.age = age
                            mongoUtil.connectToServer((err) => {
                                if (err) return res.render('error', {message:" Error,, please retry"})
                                let dbUser = mongoUtil.getDb().collection('Users')
                                dbUser.findOneAndUpdate({
                                        _id: objectId(req.session.userId)
                                    },
                                    {
                                        $set: ret
                                    },
                                    out,
                                    (err, resul) => {
                                        if (err) return res.render('error', {message:" Error,, please retry"})
                                        if (resul) {
                                            req.session.user = resul.value
                                            return res.render('profile', {user: req.session.user})
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
                    }
                } catch (e) {
                    req.session.user = user
                    return res.render('profile', {
                        user: user,
                        message: "Sorry this is not the age for our service"
                    })
                }
            }else{
                req.session.user = user
                return res.render('profile', {
                    user: user,
                    message: "Invalid Input"
                })
            }
        } catch (e) {
            req.session.user = user
            return res.render('profile', {
                user: user,
                message: "Sorry this is not the age for our service"
            })
        }

    },

    AddTags: (req, res) => {

        let id = req.session.user._id
        let user = req.session.user
        let tag = req.body.tags
        if (tag !== undefined && tag !== "" && tag.length < 12) {
            mongoUtil.connectToServer(err => {
                if (err) return res.render('error', {message:" Error,, please retry"})
                let dbUser = mongoUtil.getDb().collection('Users')
                dbUser.findOneAndUpdate({
                        _id: objectId(id)
                    },
                    {
                        $addToSet: {
                            "tags": tag
                        }
                    },
                    out,
                    (err, result) => {
                        if (err) return res.render('error', {message:" Error,, please retry"})
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
            return res.render('profile', {
                user: user,
                message: "Invalid Input tags"
            })
        }
    },

    DellTags: (req, res) => {

        let id = req.session.user._id
        let user = req.session.user
        let tag = req.body.info
        if (tag !== undefined && tag !== "") {
            mongoUtil.connectToServer(err => {
                if (err) return res.render('error', {message:" Error,, please retry"})
                let dbUser = mongoUtil.getDb().collection('Users')
                dbUser.findOneAndUpdate({
                        _id: objectId(id)
                    },
                    {
                        $pull: {
                            "tags": tag
                        }
                    },
                    out,
                    (err, result) => {
                        if (err) return res.render('error', {message:" Error,, please retry"})
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

    CheckLocation: req => {
        if (req.session.user.location === undefined || req.session.user.location === '') {
            let id = req.session.user._id
            let ipToFind = req.ip
            if (ipToFind === "::1") {
                ipToFind = "62.210.32.10"
            }
            ipLoc.satelize({ip: ipToFind}, (err, payload) => {
                if (err) return res.render('error', {message:" Error,, please retry"})
                else if (payload) {
                    NodeGeocoder.reverse({
                            lat: payload.latitude,
                            lon: payload.longitude
                        },
                        (err, resu) => {
                            if (err) return res.render('error', {message:" Error,, please retry"})
                            else {
                                let location = {}
                                location.coordinates = [resu[0].longitude, resu[0].latitude]
                                location.type = 'Point'
                                mongoUtil.connectToServer(err => {
                                    console.log("Hello1")
                                    if (err) return res.render('error', {message:" Error,, please retry"})
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
                                        out,
                                        err => {
                                            return err
                                        })
                                })
                            }
                        })
                }
            })
        }
    },

    FindAdressWithIP: (req, res) => {
        let id = req.session.user._id
        let user = req.session.user
        let ipToFind = req.ip
        if (ipToFind === "::1") {
            ipToFind = "62.210.32.118"
        }
        ipLoc.satelize({ip: ipToFind}, (err, payload) => {
            if (err) return res.render('error', {message:" Error,, please retry"})
            else if (payload) {
                NodeGeocoder.reverse({
                        lat: payload.latitude,
                        lon: payload.longitude
                    },
                    (err, resu) => {
                        if (err) return res.render('error', {message:" Error,, please retry"})
                        else {
                            let location = {}
                            location.coordinates = [resu[0].longitude, resu[0].latitude]
                            location.type = 'Point'
                            mongoUtil.connectToServer(err => {
                                if (err) return res.render('error', {message:" Error,, please retry"})
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
                                    out,
                                    (err, result) => {
                                        if (err) return res.render('error', {message:" Error,, please retry"})
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
        let id = req.session.user._id
        if (city !== undefined || city !== "") {
            NodeGeocoder.geocode(city, (err, resu) => {
                if (err) res.sendStatus(500)
                if (resu.length === 0) return module.exports.FindAdressWithIP(req, res)
                else if (resu[0].location !== '' && resu[0].latitude !== '' && resu.length !== 0) {
                    let location = {}
                    location.type = 'Point'
                    location.coordinates = [resu[0].longitude, resu[0].latitude]
                    mongoUtil.connectToServer((err) => {
                        if (err) return res.render('error', {message:" Error,, please retry"})
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
                            out,
                            (err, result) => {
                                if (err) return res.render('error', {message:" Error,, please retry"})
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
                out,
                (err, ret) => {
                    if (err) return res.render('error', {message:" Error,, please retry"})
                    else {
                        req.session.user = ret.value
                        return res.render('profile', {
                            user: req.session.user,
                            message: 'All your notifications are cleared'
                        })
                    }
                })
        }
    },

    GuestPic: (req, res) => {
        let {idForGuestPic, guestPic} = req.body
        const user = req.session.user
        if (idForGuestPic !== undefined && guestPic !== undefined && idForGuestPic !== '' && guestPic !== '') {
            // let oldGuestPic = req.session.user.guestPic
            mongoUtil.connectToServer(err => {
                if (err) return res.render('error', {message:" Error,, please retry"})
                else {
                    let dbUser = mongoUtil.getDb().collection("Users")
                    dbUser.findOneAndUpdate({
                            _id: objectId(user._id)
                        },
                        {
                            $set: {
                                'guestPic': guestPic
                            },
                            $pull: {
                                'pics': guestPic
                            },
                            // $push: {
                            //     'pics':oldGuestPic
                            // }
                        },
                        out,
                        (err, resUpdateMe) => {
                            if (err) return res.render('error', {message:" Error,, please retry"})
                            else {
                                req.session.user = resUpdateMe.value
                                res.render('profile', {
                                    user: req.session.user,
                                    message: "Guest pic actualisate"
                                })
                            }
                        })
                }
            })
        } else {
            req.session.user = user
            return res.render('profile', {
                user: user,
                message: "Invalid input"
            })
        }
    },

    DellPics: (req, res) => {
        let {idForDelPic, delpics} = req.body
        const user = req.session.user
        if (idForDelPic !== undefined && delpics !== undefined) {
            mongoUtil.connectToServer(err => {
                if (err) return res.render('error', {message:" Error,, please retry"})
                else {
                    let dbUser = mongoUtil.getDb().collection('Users')
                    let dell = {}
                    if(idForDelPic === user.guestPic)
                    {
                        dell = {

                            $pull: {
                                'pics': delpics
                            },
                            $unset: {
                                'guestPic': delpics
                            },
                            $addToSet: {
                                'pics': user.guestPic
                            }

                        }

                    }else{
                        dell = {
                            $pull: {
                                'pics': delpics
                            }
                        }
                    }
                    dbUser.findOneAndUpdate({
                            _id: objectId(idForDelPic)
                        },
                        dell,
                        out,
                        (err, resDellPics) => {
                            if (err) return res.render('error', {message:" Error,, please retry"})
                            else {
                                return res.render('profile', {
                                    user: resDellPics.value,
                                    message: "Pic dell"
                                })
                            }
                        }
                    )
                }
            })
        }
        else {
            req.session.user = user
            res.render('profile', {
                user: req.session.user,
                message: "Invalid Input"
            })
        }
    },


}