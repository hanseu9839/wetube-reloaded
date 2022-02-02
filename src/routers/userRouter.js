import express from "express";
import {postEdit,getEdit, see, logout,startGithubLogin,finishGithubLogin } from "../controllers/usersController";
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";
const userRouter = express.Router();

userRouter.get(":id",see);
userRouter.get("/logout",protectorMiddleware,logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);

userRouter.get("/github/start",publicOnlyMiddleware ,startGithubLogin);
userRouter.get("/github/finish",publicOnlyMiddleware ,finishGithubLogin);
export default userRouter;