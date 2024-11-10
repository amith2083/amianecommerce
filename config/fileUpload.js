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
const upload = multer({
  storage,
});
export default upload;

// import multer from "multer";
// import path from "path";

// // Set storage engine for multer
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Set destination folder for uploads
//     cb(null, "public/uploads/");
//   },
//   filename: function (req, file, cb) {
//     // Generate a unique filename for the uploaded file
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
//   },
// });

// // Initialize multer with storage engine for handling multiple image uploads
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1000000 }, // Limit the file size to 1MB
//   fileFilter: function (req, file, cb) {
//     // Only allow image files
//     const fileTypes = /jpeg|jpg|png/;
//     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = fileTypes.test(file.mimetype);
//     if (extname && mimetype) {
//       return cb(null, true);
//     } else {
//       cb("Error: Images Only!"); // Error if the file type is not allowed
//     }
//   },
// });

// export default upload;

