const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const compression = require('compression')
let validator = require('express-validator')
let index = require('./routes/index')
let users = require('./routes/users')
let profile = require('./routes/profile')
let updateMySession = require('./controllers/UserController').updateMySession

const app = express()

const sess = session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
})
/*

 */
// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(validator())
app.use(cookieParser())
app.use(sess)
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/static', express.static(path.join(__dirname, 'public')))

app.use('/', index)
app.use('/users', users)
// app.use('/users', (req, res, next) => {
//     console.log('Uesss')
//     if(req.session.user){
//         updateMySession(req, res)
//         next()
//     }
//     else res.render('index', {message: "Acces Denied, Log In before"})
// }, users)
app.use('/profile', profile)
// app.use('/profile', (req, res, next) => {
//     console.log(req.session)
//     if(req.session.userId){
//         updateMySession(req, res, next)
//         next()
//     }
//    // else res.render('index', {message: "Acces Denied, Log In before"})
// }, profile)
// app.use('/profile',(req, res, next) => {
// }, profile)
// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
