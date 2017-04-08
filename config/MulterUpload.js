/**
 * Created by robin on 2/27/17.
 */
const multer = require('multer')
let path = require('path')
let fs = require('fs')

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            fs.accessSync('./public/uploads')
        } catch (e) {
            fs.mkdirSync('./public/uploads')
        }
        cb(null, './public/uploads')
    },
    limits: {
        files: 1,
        fileSize: 1024 * 1024
    },
    filename: (req, file, cb) => {
        console.log(file.fieldname + '-' + Date.now() + path.extname(file.originalname))
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.JPG') {
            return cb(new Error('Only images are allowed'))
        }
        cb(null, true)
    }
}).single('image')


module.exports = upload;