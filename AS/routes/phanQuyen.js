var express = require('express');
var router = express.Router();
const User = require('../models/user');

const jwt = require('jsonwebtoken');

const checkLogin=(req, res, next)=> {
    const token = req.cookies.token;
    const id = jwt.verify(token, 'mk')
    if (token == null) return res.redirect('http://localhost:3000/');
    User.findOne({_id: id}).then((user) => {
        if (user) {
            req.data = user
             next();
        } else {
            res.send("NOT PERMISSON")
        }
    }).catch(e => res.send("Error"))
}

const checkUser=(req, res, next) =>{
    console.log(req.data.role)
    if (req.data.role === false || req.data.role === true) {
        next()
    } else {
        res.send("NOT PERMISSON")
    }
}

const checkAdmin=(req, res, next) =>{
    if (req.data.role === true) {
        next()
    } else {
        res.send("NOT PERMISSON")
    }
}

module.exports = {
    checkLogin,
    checkUser,
    checkAdmin
};