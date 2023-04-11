var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
const session = require('express-session');
const passport = require('passport');
const url = 'mongodb+srv://khangndph:2992003@atlascluster.duylrou.mongodb.net/asm?retryWrites=true&w=majority'
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var registerRouter = require('./routes/dangKi');
var loginRouter = require('./routes/dangNhap');
const helmet = require('helmet');

const methodOverride = require('method-override');
const app = express();
app.use(cookieParser())
app.use(express.urlencoded({extended: true}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));


app.use(express.json());
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err.message));
app.use(indexRouter)
app.use('/admin', adminRouter)
app.use('/users', usersRouter)
app.use('/register', registerRouter)
app.use('/login', loginRouter)
app.listen(3000, () => {
    console.log('running')
})
module.exports = app;
