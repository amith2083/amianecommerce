export const getUserTokenFromHeader = async(req)=>{
    const token = await req.cookies.userToken ||req?.headers?.authorization?.split(" ")[1];
    if(token===undefined){
        return 'No token found'
    }
    else{
        return token;
    }
}
export const getAdminTokenFromHeader = async(req)=>{
    const token = await req.cookies.adminToken || req?.headers?.authorization?.split(" ")[1];
    
    if(token === undefined){
        return 'No token found';
    }
    return token;
}