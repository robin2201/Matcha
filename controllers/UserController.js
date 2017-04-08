/**
 * Created by robin on 2/21/17.
 */
const mongoUtil = require('../config/db')
const db = mongoUtil.getDb()
const schemaValidator = require('../models/validatorSchema')
const bcrypt = require('bcrypt')
const UserM = require('../models/user')
const verifyAndSetAge = require('../controllers/UserProfile').verifyAndSetAge
const FindWithIp = require('../controllers/UserProfile').FindAdressWithIP
const objectId = require('mongodb').ObjectID

module.exports = {

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (!err) res.redirect('/')
        });
    },

    registerUser: (req, res) => {
        console.log(req.body)
        req.checkBody(schemaValidator)
        req.checkBody('cPassword', 'Not same pass').equals(req.body.password)
        let errors = req.validationErrors()
        if (errors) return res.send(errors)
        let {firstname, lastname, password, email, gender, birthday} = req.body

        let birth = verifyAndSetAge(birthday)
        mongoUtil.connectToServer((err) => {
            if (err) return res.send(err)
            let dbUsers = mongoUtil.getDb().collection('Users');
            dbUsers.findOne({
                    $or: [
                        {firstname: firstname},
                        {email: email}
                    ]
                },
                (err, result) => {
                    if (err) return res.send(err)
                    if (result) {
                        if (result.firstname === firstname)
                            return res.send('Sorry this Username is already taken')
                        else if (result.email === email)
                            return res.send('Sorry this Email is already taken')
                    } else {
                        bcrypt.hash(password, 10, (err, hash) => {
                            if (err) res.send(err)
                            UserM.create({firstname, lastname, hash, email, gender, birth},
                                (user) => {
                                    dbUsers.insertOne(user.data, (err, result) => {
                                        if (err) return res.send(err)
                                        else {
                                            const {ops, insertedCount} = result
                                            if (insertedCount > 0) {
                                                req.session.user = ops[0]
                                                req.session.userId = ops[0]._id
                                                user.SendActivationMail(req, res)
                                                res.render('index')
                                            }
                                        }
                                    })
                                })
                        })
                    }

                })
        })

    },

    signinUser: (req, res) => {
        let {firstname, password} = req.body
        req.checkBody(schemaValidator)
        let errors = req.validationErrors()
        if (errors) res.send(errors)
        mongoUtil.connectToServer((err) => {
            if (err) return res.send(err)
            let dbUsers = mongoUtil.getDb().collection('Users')
            dbUsers.findOne({
                    $and: [
                        {firstname: firstname},
                        {'emailValidation': 'true'}
                    ]
                },
                (err, resDb) => {
                    if (err) return res.send(err)
                    else if (resDb) {
                        bcrypt.compare(password, resDb.hash,
                            (err, resCpPass) => {
                                if (resCpPass === true) {
                                    req.session.user = resDb
                                    req.session.userId = resDb._id
                                    console.log(req.session)
                                    return res.render('home', {
                                        user: req.session.user,
                                        message:"Hey "+req.session.user.nickname+" happy to see you :)"
                                    })
                                } else return res.render('index',{message:"Sorry this password not match :("})
                            });
                    } else return res.render('index', {message:"sorry this name doesn't exist Or your account isn't validate :(, Please check yours Emails"})
                })
        });
    },

    valideToken: (req, res) => {
        let {id, token} = req.params

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
                (err, result) => {
                    if (err) return res.send(err)
                    if (result.ok === 1) {
                        let user = result.value
                        req.session.user = user
                        req.session.userId = user._id
                        res.render('home', {user: req.session.user})
                    } else return res.send('Sorry an error occured please try later or if the problem persits send Us an Email')
                }
            )
        })
    },

    AddPicToDb: (req, res) => {
        let id = req.session.userId
        mongoUtil.connectToServer((err) => {
            if (err) return res.sendStatus(500)
            let dbUsers = mongoUtil.getDb().collection('Users')
            console.log(req.file)
            dbUsers.findOneAndUpdate({
                    _id: objectId(id)
                },
                {
                    $addToSet: {
                        "pics": '/static/uploads/'+req.file.filename
                    }
                },
                (err, result) => {
                    if (err) return res.sendStatus(500).json(err)
                    else if (result && result.ok === 1) {
                        req.session.user = result.value
                        return res.render('profile', {
                            user:req.session.user,
                            message:"New pic Upload"
                        })
                    }
                    else return res.sendStatus(404)
                })
        })
    }
};
