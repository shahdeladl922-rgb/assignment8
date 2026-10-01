import { Router } from "express";
import * as US from "./user.service.js"
const userRouter = Router();

userRouter.post("/signup", US.signup);
userRouter.post("/signup/gmail", US.signupWithGmail);
userRouter.post("/login", US.login)
userRouter.get("/profile", US.getProfile)

export default userRouter;