import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser } from "./auth.interface";
import  jwt, { JwtPayload, SignOptions }  from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const loginUser = async(payload :ILoginUser)=>{
const {email, password} = payload;

const user = await prisma.user.findUniqueOrThrow({
    where: {email}
})


 if(user.activeStatus === "BLOCKED"){
     throw new Error ("Your account has beeen blocked. Please contact support.")
  }


const isPasswordMatch = await bcrypt.compare(password, user.password);

if(!isPasswordMatch){
    throw new Error("Password is incorrext");
}

const jwtPayLoad = {
   id: user.id,
    name: user.name,
    email : user.email,
    role: user.role 
}

// const accessToken = jwt.sign(
//     jwtPayLoad,
//     config.jwt_access_secret, 
//     {
//     expiresIn: config.jwt_access_expires_in
//      } as SignOptions

// )

const accessToken = jwtUtils.createToken(
    jwtPayLoad,
    config.jwt_access_secret, 
    config.jwt_access_expires_in as SignOptions
)

// const refreshToken = jwt.sign(
//     jwtPayLoad,
//     config.jwt_refresh_secret, 
//     {
//     expiresIn: config.jwt_refresh_expires_in
//     } as SignOptions

// )

const refreshToken = jwtUtils.createToken(
    jwtPayLoad,
    config.jwt_refresh_secret, 
    config.jwt_refresh_expires_in as SignOptions
)

//return user;

return {
    accessToken,
    refreshToken
};

}

const refreshToken = async (refreshToken : string) => {
    const verifiedRefreshToken = jwtUtils.verifiedToken(refreshToken, config.jwt_refresh_secret);

    if(!verifiedRefreshToken.success){
        throw new Error(verifiedRefreshToken.error)
    }

    const {id} = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({
        where : {
            id
        }
    })

    if(user.activeStatus === "BLOCKED"){
        throw new Error("User is blocked!")
    }

    const jwtPayload = {
        id,
        name : user.name,
        email : user.email,
        role : user.role
    }


    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    return {accessToken}
}

export const authService = {
    loginUser,
    refreshToken
}