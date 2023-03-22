var express = require('express');
var multer = require('multer');
var router = express.Router();
const path = require('path');
const mime = require('mime-types');
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.post('/', function (req, res, next) {
    let storage = multer.diskStorage({
        destination: function (req, res, next) {
            next(null, 'Lab5/upload')//đường dẫn lưu file
        },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            const fileMime = mime.lookup(file.originalname);
            if (!fileMime.startsWith('image/')) {
                return res.send('Chỉ cho phép tải lên các file hình ảnh');
            }else{
                if (fileMime!=='image/jpeg') {
                    const newName = path.basename(file.originalname, ext) + '.jpeg'; // đổi tên nếu là file khác
                    cb(null, newName);
                }
                cb(null, file.originalname);
            }


        }
    })

    var upload = multer({
        storage: storage, limits: {
            fileSize: 1024 * 1024
        }
    }).array('file', 10) // tên field của file trong form

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.send('File có kích thước lớn hơn 1M');
        }
        if (err) {
            // Xử lý lỗi khi upload thất bại
            console.log(err);
            res.send('Upload failed');
        } else {
            // Xử lý khi upload thành công
            console.log('File uploaded successfully');
            res.send('Upload successful');
        }
    })

})
module.exports = router;
