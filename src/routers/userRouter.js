import express from "express";
import {remove,edit, see, logout } from "../controllers/usersController";
const userRouter = express.Router();

userRouter.get(":id",see);
userRouter.get("/logout",logout);
userRouter.get("/edit",edit);
userRouter.get("/delete",remove);
export default userRouter;