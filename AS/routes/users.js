var express = require('express');
var router = express.Router();
const User = require('../models/user');
var multer = require('multer');
const Jimp = require('jimp');
const url = require('url');

/* GET users listing. */
router.get('/list', async (req, res, next) => {
    const users = await User.find({})

    try {
        res.render('users', {users: users });
    } catch (err) {
        res.status(500).send(err)
    }
});
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.status(200).send({ user });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
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
       if (req.file !== null){
           const imagePath = req.file.path; // lấy đường dẫn tới file từ đối tượng req.file
           const image = await Jimp.read(imagePath);
           // resize ảnh về kích thước 100x100px
           const base64Image = await image.getBase64Async(Jimp.MIME_PNG);
           user.image = base64Image;
       }
// Lưu lại dữ liệu đã update
        await user.save();
        res.redirect('/');


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
res.redirect('/users/list')
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Server error'});
    }
});
router.post('/', upload.single('image'), async (req, res, next) => {
    const imagePath = req.file.path; // lấy đường dẫn tới file từ đối tượng req.file
    const image = await Jimp.read(imagePath);
    // resize ảnh về kích thước 100x100px
    const base64Image = await image.getBase64Async(Jimp.MIME_PNG);
    // xử lý file ở đây
    const newUser = new User(req.body);
    newUser.image = base64Image;
    try {
        await newUser.save()
        res.redirect('/');
    } catch (err) {
        res.status(500).send(err)
    }
});
module.exports = router;
