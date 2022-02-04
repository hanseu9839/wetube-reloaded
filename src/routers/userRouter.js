import express from "express";
import {postEdit,getEdit, see, logout,startGithubLogin,finishGithubLogin, getChangePassword, postChangePassword } from "../controllers/usersController";
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload } from "../middlewares";
const userRouter = express.Router();

userRouter.get("/:id",see);
userRouter.get("/logout",protectorMiddleware,logout);
userRouter.route("/edit")
          .all(protectorMiddleware)
          .get(getEdit)
          .post(avatarUpload.single("avatar"),postEdit);
userRouter.route("/change-password")
          .all(protectorMiddleware)
          .get(getChangePassword)
          .post(postChangePassword);
userRouter.get("/github/start",publicOnlyMiddleware ,startGithubLogin);
userRouter.get("/github/finish",publicOnlyMiddleware ,finishGithubLogin);
export default userRouter;