
import express from "express";
import morgan from "morgan";
import MongoStore from "connect-mongo";
import session from "express-session";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";

const app = express();
const logger = morgan("dev");

app.set("view engine","pug");
app.set("views",process.cwd() +"/src/views");
app.use(logger);
app.use(express.urlencoded({extended:true}));


app.use(
    session({
	    secret:process.env.COOKIE_SECRET,
        resave:true,
        saveUninitialized:false,
        store: MongoStore.create({mongoUrl:process.env.DB_URL}),
    })
);


app.use(localsMiddleware);
app.use("/videos",videoRouter);
app.use("/users",userRouter);
app.use("/",rootRouter);

export default app;
