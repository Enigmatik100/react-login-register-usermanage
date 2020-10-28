const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, callback)=>{
        callback(null, 'upload');
    },
    filename: (req, file, callback)=>{
        const name = file.originalname.split(' ').join('_');
        const extension = file.mimetype;
        callback(null, name+Date.now()+'.'+extension);
    }
});
module.exports = multer({storage:storage}).single('file');