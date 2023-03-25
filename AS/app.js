var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
const url = 'mongodb+srv://khangndph:2992003@atlascluster.duylrou.mongodb.net/asm?retryWrites=true&w=majority'
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const helmet = require('helmet');

const methodOverride = require('method-override');
const app = express();

app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use((req, res, next) => {
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }
    next();
});
app.use(express.json());
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err.message));
app.use(indexRouter)
app.use('/users',usersRouter)

app.listen(3000, () => {
    console.log('running')
})
module.exports = app;