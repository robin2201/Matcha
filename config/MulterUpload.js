/**
 * Created by robin on 2/27/17.
 */
const multer = require('multer')

let storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if(file.mimetype !== 'image/jpeg')
            return callback('Sorry this Pic isn\'t a pic')
        console.log(file)
        callback(null, './uploads')
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-' + Date.now())
    }
});

let upload = multer({storage: storage}).single('image')


module.exports = upload;