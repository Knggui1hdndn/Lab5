var express = require('express');
var router = express.Router();
const User = require('../models/user');
var multer = require('multer');
const Jimp = require('jimp');
const url = require('url');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const upload = multer({dest: 'uploads/'}); // định nghĩa thư mục tạm để lưu file

router.post('/', upload.single('image'), async (req, res, next) => {
    const imagePath = req.file.path; // lấy đường dẫn tới file từ đối tượng req.file
    const image = await Jimp.read(imagePath);
    // resize ảnh về kích thước 100x100px
    const base64Image = await image.getBase64Async(Jimp.AUTO);
    // xử lý file ở đây

    const {text, role} = req.body

    const newUser = new User(req.body);

        newUser.role = false;

    newUser.image = base64Image;
    try {
        const x = await newUser.save();
        console.log(newUser.role);
        if (text === 's') {
            res.redirect('http://localhost:3000/admin/list')
        } else {
            res.redirect('/')
        }
    } catch (err) {
        res.status(500).send(err)
    }
});
module.exports = router;