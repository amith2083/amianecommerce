import cloudinaryPackage from 'cloudinary'
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from 'multer';
const cloudinary = cloudinaryPackage.v2;
//config cloudinary
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET_KEY

});
//create storage engine for multer
const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats:['jpg','png','jpeg'],
    params:{folder:'amian-ecommerce'}
    

});
//initate multer with storage engine
const upload = multer({
    storage
});
export default upload;