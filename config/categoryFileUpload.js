import cloudinaryPackage from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
const cloudinary = cloudinaryPackage.v2;
//config cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});
//create storage engine for multer
const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ["jpg", "png", "jpeg"],
  params: { folder: "amian-ecommerce" },
});
//initate multer with storage engine
const categoryFileUpload = multer({
  storage,
});
export default categoryFileUpload;

// import multer from "multer";
// import path from "path";

// // Set storage engine
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Set the destination folder where files will be stored
//     cb(null, "public/uploads/");
//   },
//   filename: function (req, file, cb) {
//     // Rename the file to avoid conflicts and ensure uniqueness
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
//   },
// });

// // File upload configuration
// const categoryFileUpload = multer({
//   storage: storage,
//   limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
//   fileFilter: function (req, file, cb) {
//     // Allow only specific file types
//     const fileTypes = /jpeg|jpg|png/;
//     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimeType = fileTypes.test(file.mimetype);
    
//     if (mimeType && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error("Only .png, .jpg, and .jpeg format allowed!"));
//     }
//   },
// });

// export default categoryFileUpload;

