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
    const { email, password } = req.body;

    try {
        // Tìm kiếm tài khoản người dùng với email tương ứng
        const user = await User.findOne({ email });

        if (!user) {
            // Nếu không tìm thấy tài khoản, trả về thông báo lỗi
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Kiểm tra mật khẩu


        if (password!==user.password) {
            // Nếu mật khẩu không khớp, trả về thông báo lỗi
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Nếu thông tin đăng nhập chính xác, tạo session và chuyển hướng đến trang chủ
         res.redirect('http://localhost:3000/users/list')
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', upload.single('image'), async (req, res, next) => {
    const imagePath = req.file.path; // lấy đường dẫn tới file từ đối tượng req.file
    const image = await Jimp.read(imagePath);
    // resize ảnh về kích thước 100x100px
    const base64Image = await image.getBase64Async(Jimp.MIME_PNG);
    // xử lý file ở đây

    const {text}=req.body

    const newUser = new User(req.body);
    newUser.image = base64Image;
    try {
        await newUser.save()
        if(text==='s'){
            res.redirect('http://localhost:3000/users/list')
        }else{
            res.redirect('/')
        }
     } catch (err) {
        res.status(500).send(err)
    }
});
router.post('/search', async (req, res) => {
    const { search } = req.body;

    try {
        // Tìm kiếm trong cơ sở dữ liệu
        const users = await User.find({
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ]
        });

         res.render('users', { users:users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
