import path from 'path';
import express from 'express';
import multer from 'multer';
import { protect, admin } from '../middleware/authMiddleware.js';
const router = express.Router();    
const storage = multer.diskStorage({
    // cb -> is call  back function, we call it with 2 arguments, first one is error and second one is the destination where we want to save the file  
    //  destination is a function which takes 3 arguments, request, file and callback function, we call the callback function with 2 arguments, first one is error and second one is the destination where we want to save the file
    destination(req, file, cb) {
        cb(null, 'uploads/')
    },
    // filename is a function which takes 3 arguments, request, file and callback function, we call the callback function with 2 arguments, first one is error and second one is the name of the file we want to save
    // in my case, I want to save the file with the name of the fieldname + current date + extension of the file    
    // example of it is if the fieldname is image and the current date is 2021-09-01 and the extension of the file is .jpg then the name of the file will be image-2021-09-01.jpg
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
});
// checkFileType is a function which takes 2 arguments, file and callback function, we call the callback function with 2 arguments, first one is error and second one is true if the file type is correct and false if the file type is incorrect   
// it works like this, we define a regular expression which contains the allowed file types, then we check if the extension of the file and the mimetype of the file match the regular expression, if they match then we call the callback function with true, otherwise we call the callback function with an error message                                                                         
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    // extname is a function which takes the extension of the file and converts it to lowercase, then it checks if the extension of the file matches the regular expression, if it matches then it returns true, otherwise it returns false 
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true)
    } else {
        cb('Images only!')
    }
}   

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    }
})

router.post('/', protect, admin, upload.single('image'), (req, res) => {
    res.send({
        image: `/${req.file.path}`,
        message: 'Image uploaded successfully'
    })
})

export default router;