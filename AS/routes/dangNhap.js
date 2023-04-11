var express = require('express');
var router = express.Router();
const User = require('../models/user');

const jwt = require('jsonwebtoken');
router.post('', async (req, res) => {
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
        res.setHeader('Set-Cookie', `token=${token}; HttpOnly`);//

        // Trả về kết quả
       if(user.role){
           res.redirect('http://localhost:3000/admin/list')
       }else{
           res.redirect('http://localhost:3000/users/'+user._id)
       }

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;