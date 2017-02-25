const MongoClient = require('mongodb').MongoClient


let _db;
let url = 'mongodb://localhost:27017/Matcha'

module.exports = {

    connectToServer: (callback) => {
        MongoClient.connect(url, (err, db) => {
            _db = db
            return callback(err)
        });
    },

    getDb: () => {
        return _db
    },

    closeDb: () => {
        _db.close(err)
    }
};




