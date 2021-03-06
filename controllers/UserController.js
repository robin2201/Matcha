/**
 * Created by robin on 2/21/17.
 */
const mongoUtil = require('../config/db')
const db = mongoUtil.getDb()
const schemaValidator = require('../models/validatorSchema')
const bcrypt = require('bcrypt')
const UserM = require('../models/user')
const objectId = require('mongodb').ObjectID
const checkLocation = require('./UserProfile').CheckLocation
const magicNumbers = require('mmmagic').Magic
const flag = require('mmmagic')

const projectionWithNewDocument = {
    projection: {
        hash: 0,
        email: 0,
        token: 0,
        lastname: 0,
        birthday: 0
    },
    returnOriginal: false
}

const projection = {
    //hash: 0,
    email: 0,
    token: 0,
    lastname: 0,
    birthday: 0
}

module.exports = {

    logout: (req, res) => {
        req.session.destroy(err => {
            if (!err) res.redirect('/')
        })
    },

    registerUser: (req, res) => {
        req.checkBody(schemaValidator)
        req.checkBody('cPassword', 'Not same pass').equals(req.body.password)
        let errors = req.validationErrors()
        if (errors) return res.redirect('/register')
        let {firstname, lastname, password, email, gender, birthday} = req.body
        if (gender === '' || gender === undefined || birthday === '' || birthday === undefined) {
            return res.render('index', {
                message: "Please enter a gender"
            })
        }
        let tmp = birthday.split('-')
        let today = new Date()
        let birthDate = new Date(tmp)
        let age = today.getFullYear() - birthDate.getFullYear()
        let month = today.getMonth() - birthDate.getMonth()
        if (birthDate === undefined || birthDate === '' || String(birthDate) === "Invalid Date") {
            return res.render('index', {
                message: "Sorry Date input not valid"
            })
        }
        if ((month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age) {
            if (age > 17 && age < 100) {
                mongoUtil.connectToServer(err => {
                    if (err) return res.render('error', {message: " Error,, please retry"})
                    let dbUsers = mongoUtil.getDb().collection('Users');
                    dbUsers.findOne({
                            $or: [
                                {firstname: firstname},
                                {email: email}
                            ]
                        },
                        (err, result) => {
                            if (err) return res.render('error', {message: " Error,, please retry"})
                            if (result) {
                                if (result.firstname === firstname)
                                    return res.render('index', {message: 'Sorry this Username is already taken'})
                                else if (result.email === email)
                                    return res.render('index', {message: 'Sorry this Email is already taken'})
                            } else {
                                bcrypt.hash(password, 10, (err, hash) => {
                                    if (err) return res.render('error', {message: " Error,, please retry"})
                                    UserM.create({firstname, lastname, hash, email, gender, birthday, age},
                                        user => {
                                            dbUsers.insertOne(user.data, (err, result) => {
                                                if (err) return res.send(err)
                                                else {
                                                    const {ops, insertedCount} = result
                                                    if (insertedCount > 0) {
                                                        req.session.user = ops[0]
                                                        req.session.userId = ops[0]._id
                                                        user.SendActivationMail(req, res)
                                                        return res.render('index', {message: 'Register with sucess now check your email to vslidate your account'})
                                                    }
                                                }
                                            })
                                        })
                                })
                            }

                        })
                })
            } else {
                return res.render('index', {
                    message: "Sorry Date input not valid"
                })
            }
        }
    },

    signinUser: (req, res) => {
        let {firstname, password} = req.body
        req.checkBody(schemaValidator)
        let errors = req.validationErrors()
        if (errors) return res.redirect('/login')
        mongoUtil.connectToServer(err => {
            if (err) return res.render('error', {message: " Error,, please retry"})
            let dbUsers = mongoUtil.getDb().collection('Users')
            dbUsers.findOne({
                    $and: [
                        {'firstname': firstname},
                        {'emailValidation': 'true'}
                    ]
                },
                projection,
                (err, resDb) => {
                    if (err) return res.send(err)
                    else if (resDb) {
                        bcrypt.compare(password, resDb.hash,
                            (err, resCpPass) => {
                                if (resCpPass === true) {
                                    module.exports.calculatePopularity(resDb)
                                    req.session.user = resDb
                                    if (req.session.user.location === undefined) checkLocation(req)
                                    req.session.userId = resDb._id
                                    return res.render('home', {
                                        user: req.session.user,
                                        message: "Hey " + req.session.user.nickname + " happy to see you :)"
                                    })
                                } else return res.render('index', {message: "Sorry this password not match :("})
                            })
                    } else return res.render('index', {message: "sorry this name doesn't exist Or your account isn't validate :(, Please check yours Emails"})
                })
        })

    },

    modifyPassword: (req, res) => {
        let {password, cPassword, id} = req.body
        if (password !== undefined && cPassword !== undefined && id !== undefined && (password === cPassword)) {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) return res.render('error', {message: " Error,, please retry"})
                else {
                    mongoUtil.connectToServer(err => {
                        if (err) return res.render('error', {message: " Error,, please retry"})
                        else {
                            let dbUser = mongoUtil.getDb().collection('Users')
                            dbUser.findOneAndUpdate({
                                    _id: objectId(id)
                                },
                                {
                                    $set: {
                                        'hash': hash
                                    }
                                },
                                err => {
                                    if (err) return res.render('error', {message: " Error,, please retry"})
                                    else {
                                        return res.render('index', {
                                            message: "Your pass is correctly modified"
                                        })
                                    }
                                }
                            )
                        }
                    })
                }
            })
        } else {
            return res.render('index', {message: 'Invalid input type'})
        }
    },

    valideToken: (req, res) => {
        let {id, token} = req.params
        if (id !== undefined && id !== '' && token !== undefined && token !== '') {
            mongoUtil.connectToServer((err) => {
                if (err) return res.send(err)
                let dbUsers = mongoUtil.getDb().collection('Users')
                dbUsers.findOneAndUpdate({
                        $and: [
                            {_id: objectId(id.substr(1))},
                            {token: token.substr(1)}
                        ]
                    },
                    {
                        $set: {"emailValidation": "true"}
                    },
                    projectionWithNewDocument,
                    (err, result) => {
                        if (err) return res.send(err)
                        if (result.ok === 1) {
                            let user = result.value
                            req.session.user = user
                            req.session.userId = user._id
                            res.redirect('/login')
                            //res.render('home', {user: req.session.user})
                        } else return res.send('Sorry an error occured please try later or if the problem persits send Us an Email')
                    }
                )
            })
        } else return res.render('index', {
            message: "Try later an error ocurred"
        })

    },

    AddPicToDb: (req, res) => {
        let id = req.session.user._id
        let user = req.session.user
        if (user.pics === undefined || (user.pics.length < 5 && user.guestPic === undefined) || (user.pics.length < 4 && user.guestPic)) {

            if (req.file !== undefined && req.file !== '') {
                let Magic = new magicNumbers(flag.MAGIC_MIME)
                Magic.detectFile(`./${req.file.path}`, (err, isPic) => {
                    if (err || isPic.match(/image/g) === null){
                        return res.redirect('/profile')
                    }
                    mongoUtil.connectToServer(err => {
                        if (err) return res.render('error', {message: " Error,, please retry"})
                        else {
                            let dbUsers = mongoUtil.getDb().collection('Users')
                            dbUsers.findOneAndUpdate({
                                    _id: objectId(id)
                                },
                                {
                                    $addToSet: {
                                        "pics": '/static/uploads/' + req.file.filename
                                    }
                                },
                                projectionWithNewDocument,
                                (err, result) => {
                                    if (err) return res.render('error', {message: " Error,, please retry"}).json(err)
                                    else if (result && result.ok === 1) {
                                        req.session.user = result.value
                                        return res.render('profile', {
                                            user: req.session.user,
                                            message: "New pic Upload"
                                        })
                                    }
                                    else return res.render('error', {message: " Error,, please retry"})
                                })
                        }
                    })
                })
            } else {
                req.session.user = user
                return res.render('profile', {
                    user: user,
                    message: "Invalid type file"
                })
            }
        } else {
            req.session.user = user
            return res.render('profile', {
                user: user,
                message: "You just can add 5 pics, delete one if you want to upload an other"
            })
        }
    },

    updateMySession: (req, res) => {
        if (req.session.user) {
            mongoUtil.connectToServer(err => {
                if (err) return res.render('error', {message: " Error,, please retry"})
                else {
                    let dbUser = mongoUtil.getDb().collection('Users')
                    dbUser.findOne({
                            _id: objectId(req.session.user._id)
                        },
                        //projectionWithNewDocument,
                        (err, resultMyInfo) => {
                            if (err) return err
                            else req.session.user = resultMyInfo
                        })
                }
            })

        }
        else return res.render('index', {
            message: "Please Log In before"
        })

    },

    calculatePopularity: user => {
        let pop = 0
        if (user.matches !== undefined && user._id !== undefined && user.matches.length > 0) {
            let pop = user.matches.length
            pop *= 3
        }
        if (user.nickname !== undefined) pop += 3
        if (user.pics !== undefined && user.pics.length > 0) pop += 3
        if (user.bio !== undefined) pop += 3
        mongoUtil.connectToServer(err => {
            if (err) return err
            else {
                let dbUser = mongoUtil.getDb().collection('Users')
                dbUser.findOneAndUpdate({
                        _id: objectId(user._id)
                    },
                    {
                        $set: {
                            'popularity': pop
                        }
                    },
                    err => {
                        return err
                    })
            }
        })
    }
}
