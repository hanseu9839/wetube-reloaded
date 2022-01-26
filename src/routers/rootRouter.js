import express from "express";
import { postJoin,getJoin , getLogin,postLogin} from "../controllers/usersController";
import { home ,search} from "../controllers/videoController";
const rootRouter = express.Router();


rootRouter.get("/",home);
rootRouter.route("/join").get(getJoin).post(postJoin);
rootRouter.route("/login").get(getLogin).post(postLogin);
rootRouter.get("/search",search);
export default rootRouter;