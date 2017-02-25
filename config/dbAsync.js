/**
 * Created by robin on 2/22/17.
 */
const MongoClient = require( 'mongodb' ).MongoClient


module.exports = {
    mongoConnectAsync: (res, callback) => {
        const { connect } = MongoClient;
        const url = 'mongodb://localhost:27017/Matcha';
        connect(url, (err, db) => {
            if (err) res.status(500).send('Error - Fail to connect to database');
            else {
                const {Users} = db.collection('Users');
                console.log(Users)
                return callback(Users);
            }
        });
        return (true);
    }
}
