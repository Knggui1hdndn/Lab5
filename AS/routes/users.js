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
const auth = require("./phanQuyen");
const upload = multer({dest: 'uploads/'}); // định nghĩa thư mục tạm để lưu file

router.get('/:id', auth.checkLogin,auth.checkUser, async (req, res, next) => {
    const users = await User.findById(req.params.id)

    try {
        res.render('users', {user: users});
    } catch (err) {
        res.status(500).send(err)
    }
});
router.post('/update/:id', auth.checkLogin , upload.single('image'), async (req, res) => {
    try {
        const {name, email, password} = req.body;
        const user = await User.findById(req.params.id);// Tìm user cần update bằng id
        // Cập nhật thông tin của user
        user.name = name;
        user.password = password;
        user.email = email;
        if (req.file) {
            const imagePath = req.file.path; // lấy đường dẫn tới file từ đối tượng req.file
            const image = await Jimp.read(imagePath);
            // resize ảnh về kích thước 100x100px
            const base64Image = await image.getBase64Async(Jimp.MIME_PNG);
            user.image = base64Image;
        }
// Lưu lại dữ liệu đã update
        await user.save();
        res.redirect('http://localhost:3000/users/'+req.params.id)
    } catch (error) {
        console.error(error);
        res.status(500).send({error: error});
    }
});
router.get('/i/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({error: 'User not found'});
        }
        res.send({user});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Server error'});
    }
});



module.exports = router;
