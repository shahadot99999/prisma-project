//import { auth } from './../../middlewares/auth';
import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import bcrypt from "bcryptjs";
import  httpStatus  from "http-status";
import { userController } from "./user.controller";
import { jwtUtils } from "../../utils/jwt";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
 //import  {auth}  from "../../middlewares/auth";



const router = Router();

declare global {
    namespace Express {
        interface Request{
            user ? : {
                email: string;
                name: string;
                id: string;
                role: Role;
            }
        }
    }
}



router.post("/register", userController.registerUser )
//router.get("/me", userController.getMyProfile)

const auth = (...requiredRoles : Role[])=>{
    return catchAsync(async(req: Request, res:Response, next: NextFunction)=>{
       
        //  const token = req.cookies.accessToken ?
        //     req.cookies.accessToken 
        //     :
        //     req.headers.authorization?.startsWith("Bearer ") ? 
        //     req.headers.authorization?.split(" ")[1] 
        //     : req.headers.authorization;

         let token = req.cookies.accessToken;
       if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

        if(!token){
            throw new Error("You are not logged in. Please log in thto access this resource");
        }

        const verifiedToken = jwtUtils.verifiedToken(token, config.jwt_access_secret);
        //console.log(verifiedToken);

       
        // if(verifiedToken.success){
        //   throw new Error(verifiedToken.error);
        // }

          if (!verifiedToken.success) {
      throw new Error(verifiedToken.error || 'Invalid or expired token.');
    }

         const {email, name, id, role}= verifiedToken.data as JwtPayload;

         if(requiredRoles.length && !requiredRoles.includes(role)){
            throw new Error("Forbidden . You don't have permission to access this resource .")
         }

         const user = await prisma.user.findUnique({
            where : {
                id ,
                email, 
                name,
                role
            }
         });

         if(!user){
            throw new Error(" User not found . Please log in again");
         }


         if(user.activeStatus === "BLOCKED"){
            throw new Error ("Your account has beeen blocked. Please contact support.")
         }

         req.user={
            email,
            name,
            id, 
            role
         }

         next();



    })
}



router.get("/me",
//     (req: Request, res: Response, next: NextFunction)=>{
//     console.log(req.cookies);
//     const {accessToken} = req.cookies;
//         console.log(accessToken);
    
//         const verifiedToken = jwtUtils.verifiedToken(accessToken, config.jwt_access_secret);
//         //console.log(verifiedToken);

       
//         if(verifiedToken.success){
//           throw new Error(verifiedToken.error);
//         }

//          const {email, name, id, role}= verifiedToken.data as JwtPayload;

//         // const requireRoles = ["ADMIN", "USER", "AUTHOR"];

//         const requireRoles = [Role.ADMIN, Role.AUTHOR, Role.USER];

//         if(!requireRoles.includes(role)){
//             return res.status(403).json({
//                 success: false,
//                 statusbar: httpStatus.FORBIDDEN,
//                 message: "Forbidden . You don't have permission to access this resource ."
//             })
//         }

//         req.user = {
//             email,
//             name,
//             id,
//             role
//         };
    
//     next();
// },

auth(Role.ADMIN, Role.USER, Role.AUTHOR),

userController.getMyProfile);

router.put("/my-profile", auth(Role.ADMIN, Role.USER, Role.AUTHOR), userController.updateMyProfile);

export const userRoutes = router;