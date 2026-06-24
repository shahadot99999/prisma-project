import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser } from "./auth.interface"

const loginUser = async(payload :ILoginUser)=>{
const {email, password} = payload;

const user = await prisma.user.findUniqueOrThrow({
    where: {email}
})

const isPasswordMatch = await bcrypt.compare(password, user.password);

if(!isPasswordMatch){
    throw new Error("Password is incorrext");
}

return user;

}

export const authService = {
    loginUser
}