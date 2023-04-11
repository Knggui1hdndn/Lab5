var express = require('express');
var router = express.Router();
const User = require('../models/user');

var multer = require('multer');
const Jimp = require('jimp');

const auth = require("./phanQuyen");
router.get('/list',auth.checkLogin,auth.checkAdmin, async (req, res, next) => {
    const users = await User.find({})

    try {
        res.render('admin', {users: users});
    } catch (err) {
        res.status(500).send(err)
    }
});

const upload = multer({dest: 'uploads/'}); // định nghĩa thư mục tạm để lưu file
router.post('/update/:id', auth.checkLogin , upload.single('image'), async (req, res) => {
    try {
        const {name, email, password,role} = req.body;
         const user = await User.findById(req.params.id);// Tìm user cần update bằng id
        // Cập nhật thông tin của user
        if (role) {
            user.role = true;

        }
        console.log(user.role)
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
        res.redirect('http://localhost:3000/admin/list')
    } catch (error) {
        console.error(error);
        res.status(500).send({error: error});
    }
});
router.delete('/delete/:id', auth.checkLogin,auth.checkAdmin, async (req, res) => {
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

router.post('/search', auth.checkLogin,auth.checkAdmin, async (req, res) => {
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

        res.render('admin', {users: users});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;
