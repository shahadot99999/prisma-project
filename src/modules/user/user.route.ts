import { NextFunction, Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import bcrypt from "bcryptjs";
import  httpStatus  from "http-status";
import { userController } from "./user.controller";
import { jwtUtils } from "../../utils/jwt";
import { Role } from "../../../generated/prisma/enums";

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
router.get("/me",(req: Request, res: Response, next: NextFunction)=>{
    console.log(req.cookies);
    const {accessToken} = req.cookies;
        console.log(accessToken);
    
        const verifiedToken = jwtUtils.verifiedToken(accessToken, config.jwt_access_secret);
        //console.log(verifiedToken);

       
    
        if(typeof verifiedToken === "string"){
            throw new Error (verifiedToken);
        }

         const {email, name, id, role}= verifiedToken;

        // const requireRoles = ["ADMIN", "USER", "AUTHOR"];

        const requireRoles = [Role.ADMIN, Role.AUTHOR, Role.USER];

        if(!requireRoles.includes(role)){
            return res.status(403).json({
                success: false,
                statusbar: httpStatus.FORBIDDEN,
                message: "Forbidden . You don't have permission to access this resource ."
            })
        }

        req.user = {
            email,
            name,
            id,
            role
        };
    
    next();
}, userController.getMyProfile)


export const userRoutes = router;