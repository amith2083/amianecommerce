import User from "../models/User.js";
import { getUserTokenFromHeader,getAdminTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken} from "../utils/verifyToken.js";
export const isLoggedIn = async(req,res,next)=>{
    //get tokken from header
    const token = await getUserTokenFromHeader(req);
    console.log(token)
    if (!token) {
        return res.redirect('/register');
    }
    //verify token
    const decodedUser = verifyToken(token)
    // save user in object 
    // if (!decodedUser){
    //     // throw new Error ('token expired/invalid,please login again')
    // }
 
    // if (decodedUser) {
    //     req.userAuthId = decodedUser.id;

    //     if (req.path === '/register' || req.path === '/login') {
    //         return res.redirect('/home');
    //     }
    // }

//     next();
// };
   
    if (!decodedUser) {
        
            return res.redirect('/register'); // Redirect to admin login if from admin route
    
    }
    const user = await User.findById(decodedUser.id);
        if ( user.isBlocked) {
            res.cookie('userToken', '', { maxAge: 1 });
            return res.render('account',{ message: 'Your account is blocked. Please contact admin.' });
        }
        req.userAuthId = decodedUser?.id;
        next()
    

};
export const isLoggedAdmin = async(req,res,next)=>{
    //get tokken from header
    const token = await getAdminTokenFromHeader(req);
    console.log(token)
    if (!token) {
        return res.redirect('/admin/adminlogin');
    }
    //verify token
    const decodedAdmin = verifyToken(token)
    // save user in object 
    // if (!decodedUser){
    //     // throw new Error ('token expired/invalid,please login again')
    // }
    if (!decodedAdmin) {
        // Check if the request is coming from an admin or user route
        // const adminRoute = req.path.startsWith('/api/v1/admin');
        // console.log(adminRoute)
        // if (adminRoute) {a
            return res.redirect('/admin/adminlogin'); // Redirect to admin login if from admin route
    //     } else {
    //         return res.redirect('/api/v1/users/register'); // Redirect to user account login if from user route
    //     }
    // }
    }
        req.adminAuthId = decodedAdmin?.id;
        next()
    

};