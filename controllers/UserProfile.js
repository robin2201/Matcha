/**
 * Created by robin on 3/2/17.
 */
const mongoUtil = require('../config/db');
//const db = mongoUtil.getDb();
const schemaValidator = require('../models/validatorSchema');
const objectId = require('mongodb').ObjectID


module.exports = {
    ModifyNickname: (req, res) => {
        let value = req.body
        let id = req.session.userId
        if (value) {
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

    }
}