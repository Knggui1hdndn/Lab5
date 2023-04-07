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

/* GET users listing. */
function isAuthenticated() {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('http://localhost:3000/');
    }
}


// Đăng nhập thành công, lưu thông tin vào session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// Xác thực người dùng từ session
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});
router.get('/list',authenticateToken, async (req, res, next) => {
    const users = await User.find({})

    try {
        res.render('users', {users: users});
    } catch (err) {
        res.status(500).send(err)
    }
});
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({error: 'User not found'});
        }
        res .send({user});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Server error'});
    }
});
const upload = multer({dest: 'uploads/'}); // định nghĩa thư mục tạm để lưu file
router.post('/update/:id', upload.single('image'), async (req, res) => {
    try {
        const {name, email, password} = req.body;
        const user = await User.findById(req.params.id);// Tìm user cần update bằng id
        // Cập nhật thông tin của user
        user.name = name;
        user.password = password;
        user.email = email;
        if (req.file !== null) {
            const imagePath = req.file.path; // lấy đường dẫn tới file từ đối tượng req.file
            const image = await Jimp.read(imagePath);
            // resize ảnh về kích thước 100x100px
            const base64Image = await image.getBase64Async(Jimp.MIME_PNG);
            user.image = base64Image;
        }
// Lưu lại dữ liệu đã update
        await user.save();
        res.redirect('http://localhost:3000/users/list')


    } catch (error) {
        console.error(error);
        res.status(500).send({error: error});
    }
});
router.delete('/delete/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).send({error: 'User not found'});
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Server error'});
    }
});
router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    try {
        // Tìm kiếm tài khoản người dùng với email tương ứng
        const user = await User.findOne({email});

        if (!user) {
            // Nếu không tìm thấy tài khoản, trả về thông báo lỗi
            return res.status(400).json({message: 'Invalid email or password'});
        }

        // Kiểm tra mật khẩu


        if (password !== user.password) {
            // Nếu mật khẩu không khớp, trả về thông báo lỗi
            return res.status(400).json({message: 'Invalid email or password'});
        }
        // Tạo token
        const token = jwt.sign({_id: user._id}, "mk");

        // Thiết lập cookie trên header
        res.setHeader('Set-Cookie', `token=${token}; HttpOnly`);

        // Trả về kết quả
       
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

router.post('/', upload.single('image'), async (req, res, next) => {
    const imagePath = req.file.path; // lấy đường dẫn tới file từ đối tượng req.file
    const image = await Jimp.read(imagePath);
    // resize ảnh về kích thước 100x100px
    const base64Image = await image.getBase64Async(Jimp.AUTO);
    // xử lý file ở đây

    const {text} = req.body

    const newUser = new User(req.body);
    newUser.image = base64Image;
    try {
        const x = await newUser.save();

        if (text === 's') {
            res.redirect('http://localhost:3000/users/list')
        } else {
            res.redirect('/')
        }
    } catch (err) {
        res.status(500).send(err)
    }
});
router.post('/search', async (req, res) => {
    const {search} = req.body;

    try {
        // Tìm kiếm trong cơ sở dữ liệu
        const users = await User.find({
            $or: [
                {firstName: {$regex: search, $options: 'i'}},
                {lastName: {$regex: search, $options: 'i'}},
                {email: {$regex: search, $options: 'i'}},
            ]
        });

        res.render('users', {users: users});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});
function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (token == null) return res.redirect('http://localhost:3000/');

    jwt.verify(token, 'mk', (err, user) => {
        if (err) return res.sendStatus(403);

        req.user = user;

        next();
    });
}
module.exports = router;
