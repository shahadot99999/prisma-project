import  httpStatus from 'http-status';
import { NextFunction, Request, RequestHandler, response, Response } from "express";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import bcrypt from "bcryptjs";
import { userService } from './user.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

// const catchAsync = (fn: RequestHandler)=>{
 
//  return async(req : Request, res: Response, next: NextFunction)=>{
 
//  try {
//     await fn(req, res, next);
//   } catch (error) {
//       console.log(error);
//          res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//              success: false,
//              statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//              message: "Failed to register user",
//              error: (error as Error).message
//          })
//   }}
// }


// const registerUser = async(req : Request, res: Response)=>{

//     try {
//         const payload = req.body;

//         const user = await userService.registerUserIntoDB(payload);

//         res.status(httpStatus.CREATED).json({
//             success: true,
//             statusCode: httpStatus.CREATED,
//             message: "User registered successfully",

//             data: {
//                 user
//             }
//         });
//     } catch (error) {

//         console.log(error);
//         res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//              success: false,
//             statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//             message: "Failed to register user",
//             error: (error as Error).message
//         })
//     }
// }



const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
   const payload = req.body;
   
   const user = await userService.registerUserIntoDB(payload);

//    res.status(httpStatus.CREATED).json({
//     success: true,
//     statusCode: httpStatus.CREATED,
//     message: "User registered successfully",
//     data:{
//         user 
//     }
//    })
sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User register successfully",
    data:{ user}
})

})

const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
   
})

export const userController = {
    registerUser,
    getMyProfile
}